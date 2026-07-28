"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SectionTitle from "@/components/ui/SectionTitle";
import { productInterestOptions } from "@/lib/constants";
import {
  ContactFormData,
  deliveryRegionOptions,
  estimatedQuantityOptions,
  getContactFormFieldErrors,
  initialContactFormData,
  inquiryTypes,
  inquiryTypeLabel,
  isValidPhone,
  palletSizeOptions,
  submitLabel,
  unknownPalletSizeOption,
} from "@/lib/contactSchema";

const usePurposes = ["보관", "국내 운송", "수출 운송", "랙 적재", "자동화 설비", "기타"];
const yesNoUnknown = ["예", "아니오", "미정"];
const maxAttachmentBytes = 50 * 1024 * 1024;
const uploadSupportEmail = "bossjhb@naver.com";
const allowedAttachmentTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const resizableImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const validationFieldOrder = [
  "inquiryType",
  "phone",
  "email",
  "responseMethod",
  "deliveryRegion",
  "message",
  "privacyAgreed",
] as const;
type ValidationField = (typeof validationFieldOrder)[number];
const validationTargetIds: Record<ValidationField, string> = {
  inquiryType: "inquiry-type-field",
  phone: "phone",
  email: "email",
  responseMethod: "response-method-field",
  deliveryRegion: "deliveryRegion",
  message: "message",
  privacyAgreed: "privacyAgreed",
};

function focusValidationField(field: ValidationField) {
  const target = document.getElementById(validationTargetIds[field]);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.focus({ preventScroll: true });
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // 보안 정책으로 Clipboard API를 사용할 수 없으면 아래 방식으로 재시도한다.
    }
  }

  const temporaryInput = document.createElement("textarea");
  try {
    temporaryInput.value = value;
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    temporaryInput.remove();
  }
}

function DimensionInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex min-w-0 flex-col" htmlFor={id}>
      <span className="mb-2 flex min-h-6 items-center text-sm font-bold text-[var(--text)]">{label} (선택)</span>
      <span className="flex min-w-0 items-center gap-2">
        <input className="min-h-12 min-w-0 flex-1 rounded-md border border-[var(--line)] bg-white px-4 text-base outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)]" id={id} inputMode="decimal" onChange={(event) => onChange(event.target.value)} value={value} />
        <span className="w-8 shrink-0 text-sm font-bold text-[var(--sub-text)]">mm</span>
      </span>
    </label>
  );
}

export default function InquirySection({ phone = "" }: { phone?: string }) {
  const [formData, setFormData] = useState<ContactFormData>(initialContactFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [phoneCopyMessage, setPhoneCopyMessage] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [showUploadEmailHelp, setShowUploadEmailHelp] = useState(false);
  const [uploadEmailCopyMessage, setUploadEmailCopyMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);

  function updateField<K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
    setSuccess("");
    setError("");
  }

  function updateDetail(field: string, value: string) {
    setFormData((current) => ({ ...current, details: { ...current.details, [field]: value } }));
    setSuccess("");
    setError("");
  }

  function updateInquiryType(inquiryType: ContactFormData["inquiryType"]) {
    setFormData((current) => ({
      ...current,
      inquiryType,
      requestedPalletSizes:
        inquiryType === "other" ? [] : current.requestedPalletSizes,
    }));
    setSuccess("");
    setError("");
  }

  function togglePalletSize(value: string) {
    setFormData((current) => {
      const selected = current.requestedPalletSizes;
      const requestedPalletSizes =
        value === unknownPalletSizeOption
          ? selected.includes(unknownPalletSizeOption)
            ? []
            : [unknownPalletSizeOption]
          : selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [
                ...selected.filter((item) => item !== unknownPalletSizeOption),
                value,
              ];
      return { ...current, requestedPalletSizes };
    });
    setSuccess("");
    setError("");
  }

  function toggleAllPalletSizes() {
    const allSelected = palletSizeOptions.every((size) =>
      formData.requestedPalletSizes.includes(size),
    );
    updateField("requestedPalletSizes", allSelected ? [] : [...palletSizeOptions]);
  }

  function updateAttachments(files: FileList | null) {
    const nextFiles = Array.from(files ?? []);
    if (attachments.length + nextFiles.length > 3) {
      setAttachmentError("첨부파일은 최대 3개까지 선택해 주세요.");
      setShowUploadEmailHelp(false);
      setUploadEmailCopyMessage("");
      setAttachmentInputKey((current) => current + 1);
      return;
    }

    const tooLarge = nextFiles.find(
      (file) => file.size > maxAttachmentBytes,
    );
    if (tooLarge) {
      const cannotResize = !resizableImageTypes.has(tooLarge.type);
      setAttachmentError(
        cannotResize
          ? `${tooLarge.name} 파일은 자동으로 용량을 줄일 수 없는 형식이며 50MB를 초과해 업로드할 수 없습니다. 50MB 이하로 줄이거나 파일을 나누어 첨부해 주세요. 어려우시면 아래 이메일로 보내 주세요.`
          : `${tooLarge.name} 파일은 용량이 너무 커서 웹에서 업로드할 수 없습니다. 50MB 이하로 줄인 뒤 다시 첨부해 주세요. 어려우시면 아래 이메일로 보내 주세요.`,
      );
      setShowUploadEmailHelp(true);
      setUploadEmailCopyMessage("");
      setAttachmentInputKey((current) => current + 1);
      return;
    }

    const unsupported = nextFiles.find(
      (file) => !allowedAttachmentTypes.has(file.type),
    );
    if (unsupported) {
      setAttachmentError(
        `${unsupported.name} 파일은 지원하지 않습니다. PDF, JPG, PNG, WEBP 파일만 첨부할 수 있습니다.`,
      );
      setShowUploadEmailHelp(false);
      setUploadEmailCopyMessage("");
      setAttachmentInputKey((current) => current + 1);
      return;
    }

    setAttachments((current) => [...current, ...nextFiles]);
    setAttachmentError("");
    setShowUploadEmailHelp(false);
    setUploadEmailCopyMessage("");
    setAttachmentInputKey((current) => current + 1);
  }

  async function handlePhoneAction(event: React.MouseEvent<HTMLAnchorElement>) {
    const isMobileDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (isMobileDevice) return;

    event.preventDefault();
    const copied = await copyText(phone);
    if (copied) {
      setPhoneCopyMessage("전화번호가 복사되었습니다.");
    } else {
      setPhoneCopyMessage(`복사하지 못했습니다. 전화번호: ${phone}`);
    }
  }

  async function copyUploadSupportEmail() {
    const copied = await copyText(uploadSupportEmail);
    setUploadEmailCopyMessage(
      copied
        ? "이메일 주소가 복사되었습니다."
        : `복사하지 못했습니다. 이메일: ${uploadSupportEmail}`,
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    const validationErrors = getContactFormFieldErrors(formData);
    setValidationAttempted(true);
    setPhoneTouched(true);
    if (Object.keys(validationErrors).length > 0) {
      setError("");
      const firstInvalidField = validationFieldOrder.find(
        (field) => validationErrors[field],
      );
      if (firstInvalidField) {
        requestAnimationFrame(() => focusValidationField(firstInvalidField));
      }
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, email: formData.email.trim() }) });
      const result = (await response.json()) as { success: boolean; message?: string; inquiryId?: string };
      if (!response.ok || !result.success) throw new Error(result.message || "문의 접수 중 문제가 발생했습니다.");
      let attachmentWarning = "";
      if (attachments.length && result.inquiryId) {
        setUploading(true);
        const body = new FormData();
        attachments.forEach((file) => body.append("files", file));
        const uploadResponse = await fetch(`/api/contact/${result.inquiryId}/attachments`, { method: "POST", body });
        const uploadResult = (await uploadResponse.json().catch(() => null)) as {
          code?: string;
          message?: string;
          supportEmail?: string;
        } | null;
        if (!uploadResponse.ok) {
          const uploadMessage =
            uploadResult?.message ||
            "첨부파일은 저장되지 않았으니 회신 시 전달해 주세요.";
          attachmentWarning = ` ${uploadMessage}`;
          setAttachmentError(uploadMessage);
          setShowUploadEmailHelp(
            uploadResult?.code === "FILE_TOO_LARGE" ||
              uploadResult?.supportEmail === uploadSupportEmail,
          );
          setUploadEmailCopyMessage("");
        }
      }
      setSuccess(`접수번호 ${result.inquiryId} · ${inquiryTypeLabel(formData.inquiryType)} 접수가 완료되었습니다.${attachmentWarning}`);
      setFormData(initialContactFormData);
      setValidationAttempted(false);
      setPhoneTouched(false);
      setAttachments([]);
      setAdvancedOpen(false);
      setAttachmentInputKey((current) => current + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "문의 접수 중 문제가 발생했습니다.");
    } finally {
      setUploading(false);
      setIsLoading(false);
    }
  }

  const isConsulting = formData.inquiryType === "consulting";
  const isCatalog = formData.inquiryType === "other";
  const currentFieldErrors = getContactFormFieldErrors(formData);
  const inquiryTypeError = validationAttempted
    ? currentFieldErrors.inquiryType
    : undefined;
  const phoneError = validationAttempted
    ? currentFieldErrors.phone
    : phoneTouched && formData.phone && !isValidPhone(formData.phone)
      ? currentFieldErrors.phone
      : undefined;
  const deliveryRegionError = validationAttempted
    ? currentFieldErrors.deliveryRegion
    : undefined;
  const emailError = validationAttempted ? currentFieldErrors.email : undefined;
  const responseMethodError = validationAttempted
    ? currentFieldErrors.responseMethod
    : undefined;
  const messageError = validationAttempted
    ? currentFieldErrors.message
    : undefined;
  const privacyError = validationAttempted
    ? currentFieldErrors.privacyAgreed
    : undefined;
  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : "";

  return (
    <section id="inquiry" className="bg-[var(--primary-dark)] px-5 pt-12 pb-20 lg:px-8 lg:pb-[72px]">
      <div className="mx-auto grid min-w-0 max-w-[1200px] gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-start lg:gap-10">
        <div className="min-w-0">
          <SectionTitle dark eyebrow="Inquiry" title="견적 및 문의" description="문의 유형에 맞는 정보만 간단히 입력해 주세요. 필요한 상세 조건은 담당자가 접수 후 함께 확인합니다." />
          <aside className="mt-7 rounded-lg border border-white/12 bg-white/[0.04] p-5 text-white">
            <p className="text-sm font-bold text-[var(--accent-gold)]">상담 안내</p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-white/78">
              {["문의 유형별 맞춤 입력", "필요한 정보만 간편하게 작성", "맞춤 규격 및 적용 환경 상담", "도면과 현장사진 첨부 가능", "전화·문자·이메일 회신 지원"].map((item) => <li className="flex min-w-0 items-center gap-3" key={item}><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gold)] text-[11px] font-black text-[var(--primary-deep)]">✓</span><span className="min-w-0">{item}</span></li>)}
            </ul>
          </aside>
          {phoneHref ? (
            <>
              <LinkButton
                className="mt-3 w-full gap-2"
                href={phoneHref}
                onClick={(event) => void handlePhoneAction(event)}
                variant="light"
              >
                <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
                  <path d="M7.1 3.7 9.5 7.9 7.8 9.6c1.2 2.6 3.3 4.7 5.9 5.9l1.7-1.7 4.2 2.4c.5.3.7.8.6 1.4l-.5 2.4c-.1.6-.7 1-1.3 1C9.9 21 3 14.1 3 5.6c0-.6.4-1.2 1-1.3l2.4-.5c.2-.1.5-.1.7-.1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
                </svg>
                전화하기
              </LinkButton>
              <p className="mt-2 text-center text-xs leading-5 text-white/60">
                모바일은 바로 통화 · PC는 전화번호 복사
              </p>
              <p aria-live="polite" className="mt-1 min-h-5 text-center text-xs font-bold text-[var(--accent-gold)]">
                {phoneCopyMessage}
              </p>
            </>
          ) : null}
        </div>

        <form className="min-w-0 max-w-full rounded-lg bg-white p-5 sm:p-8" noValidate onSubmit={handleSubmit}>
          <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 md:[&>*]:min-w-0">
            <h3 className="col-span-full text-lg font-bold text-[var(--text)]">1. 문의 유형</h3>
            <fieldset
              aria-describedby={inquiryTypeError ? "inquiry-type-error" : undefined}
              aria-invalid={Boolean(inquiryTypeError)}
              className="col-span-full min-w-0"
              id="inquiry-type-field"
              tabIndex={-1}
            >
              <legend className="mb-2 flex min-h-6 items-center text-sm font-bold text-[var(--text)]">문의 유형 (필수)</legend>
              <div className={`grid min-w-0 gap-2 sm:grid-cols-2 ${inquiryTypeError ? "rounded-lg border border-[var(--alert)] p-2" : ""}`}>
                {inquiryTypes.map((item) => {
                  const selected = formData.inquiryType === item.value;
                  return (
                    <button
                      aria-pressed={selected}
                      className={`flex min-h-24 min-w-0 items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${selected ? "border-[var(--primary)] bg-[var(--sub-mint)]" : "border-[var(--line)] bg-white hover:border-[var(--primary)]"}`}
                      key={item.value}
                      onClick={() => updateInquiryType(item.value)}
                      type="button"
                    >
                      <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--sub-sage)]"}`}>{selected ? "✓" : ""}</span>
                      <span className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm text-[var(--text)]">{item.label}</strong><span className="mt-1 block [overflow-wrap:anywhere] text-xs leading-5 text-[var(--sub-text)]">{item.description}</span></span>
                    </button>
                  );
                })}
              </div>
              {inquiryTypeError ? (
                <p className="mt-2 text-sm font-bold text-[var(--alert)]" id="inquiry-type-error">
                  {inquiryTypeError}
                </p>
              ) : null}
            </fieldset>

            <h3 className="col-span-full mt-2 border-t border-[var(--line)] pt-6 text-lg font-bold text-[var(--text)]">2. 기본 정보</h3>
            <div className="flex min-w-0 flex-col">
              <Input aria-describedby={phoneError ? "phone-error" : undefined} aria-invalid={Boolean(phoneError)} aria-required="true" id="phone" inputMode="tel" label="전화번호 (필수)" maxLength={30} onBlur={() => setPhoneTouched(true)} onChange={(event) => updateField("phone", event.target.value)} placeholder="연락 가능한 번호를 입력해 주세요" required type="tel" value={formData.phone} />
              {phoneError ? (
                <p className="mt-2 text-sm font-bold text-[var(--alert)]" id="phone-error">
                  {phoneError}
                </p>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col">
              <Input aria-describedby={emailError ? "email-error" : undefined} aria-invalid={Boolean(emailError)} autoComplete="email" id="email" label="이메일 (선택)" maxLength={254} onChange={(event) => updateField("email", event.target.value)} placeholder="name@company.com" type="email" value={formData.email} />
              {emailError ? (
                <p className="mt-2 text-sm font-bold text-[var(--alert)]" id="email-error">
                  {emailError}
                </p>
              ) : null}
            </div>
            <Input id="companyName" label="회사명 (선택)" maxLength={100} onChange={(event) => updateField("companyName", event.target.value)} value={formData.companyName} />
            <Input id="contactPerson" label="담당자명 (선택)" maxLength={50} onChange={(event) => updateField("contactPerson", event.target.value)} value={formData.contactPerson} />
            <fieldset aria-describedby={responseMethodError ? "response-method-error" : undefined} aria-invalid={Boolean(responseMethodError)} className="col-span-full min-w-0" id="response-method-field" tabIndex={-1}><legend className="mb-2 flex min-h-6 items-center text-sm font-bold">연락 선호 방식 (선택)</legend><div className={`grid min-w-0 grid-cols-2 gap-2 rounded-lg sm:grid-cols-4 ${responseMethodError ? "border border-[var(--alert)] p-2" : ""}`}>{[{ value: "EMAIL", label: "이메일" }, { value: "PHONE", label: "전화" }, { value: "TEXT", label: "문자" }, { value: "ANY", label: "상관없음" }].map((option) => { const selected = formData.responseMethod === option.value; return <button aria-pressed={selected} className={`inline-flex min-h-12 min-w-0 items-center justify-center rounded-lg border px-3 text-sm font-bold transition ${selected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--line)] bg-white text-[var(--text)] hover:border-[var(--primary)]"}`} key={option.value} onClick={() => updateField("responseMethod", option.value as ContactFormData["responseMethod"])} type="button">{option.label}</button>; })}</div>{responseMethodError ? <p className="mt-2 text-sm font-bold text-[var(--alert)]" id="response-method-error">{responseMethodError}</p> : null}</fieldset>

            <h3 className="col-span-full mt-2 border-t border-[var(--line)] pt-6 text-lg font-bold text-[var(--text)]">3. 문의 상세</h3>
            <Select containerClassName="col-span-full md:col-span-1" id="productInterest" label="관심 제품 (선택)" onChange={(event) => updateField("productInterest", event.target.value)} options={productInterestOptions} value={formData.productInterest} />
            {!isCatalog ? <fieldset className="col-span-full min-w-0">
              <legend className="mb-2 flex min-h-6 items-center text-sm font-bold text-[var(--text)]">
                희망 팔레트 규격 (선택)
              </legend>
              <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                {["모두 선택", ...palletSizeOptions, unknownPalletSizeOption].map((option) => {
                  const selected =
                    option === "모두 선택"
                      ? palletSizeOptions.every((size) =>
                          formData.requestedPalletSizes.includes(size),
                        )
                      : formData.requestedPalletSizes.includes(option);
                  return (
                    <label
                      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-bold transition ${
                        selected
                          ? "border-[var(--primary)] bg-[var(--sub-mint)] text-[var(--primary-dark)]"
                          : "border-[var(--line)] bg-white text-[var(--text)] hover:border-[var(--primary)]"
                      }`}
                      key={option}
                    >
                      <input
                        checked={selected}
                        className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                        onChange={() =>
                          option === "모두 선택"
                            ? toggleAllPalletSizes()
                            : togglePalletSize(option)
                        }
                        type="checkbox"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--sub-text)]">
                규격을 모르시면 “잘 모르겠음”을 선택해 주세요. 담당자가 상담 시 확인합니다.
              </p>
            </fieldset> : null}

            <div className="flex min-w-0 flex-col">
              <Select aria-describedby={deliveryRegionError ? "delivery-region-error" : undefined} aria-invalid={Boolean(deliveryRegionError)} aria-required="true" id="deliveryRegion" label="납품 지역 (필수)" onChange={(event) => updateDetail("deliveryRegion", event.target.value)} options={[...deliveryRegionOptions]} required value={formData.details.deliveryRegion || ""} />
              {deliveryRegionError ? (
                <p className="mt-2 text-sm font-bold text-[var(--alert)]" id="delivery-region-error">
                  {deliveryRegionError}
                </p>
              ) : null}
            </div>
            <Select id="estimatedQuantity" label="예상 수량 (선택)" onChange={(event) => updateField("estimatedQuantity", event.target.value)} options={[...estimatedQuantityOptions]} value={formData.estimatedQuantity} />
            <Select id="exportUse" label="수출용 여부 (선택)" onChange={(event) => updateDetail("exportUse", event.target.value)} options={yesNoUnknown} value={formData.details.exportUse || ""} />
            <Input id="desiredDeliveryDate" label="희망 납기 (선택)" onChange={(event) => updateDetail("desiredDeliveryDate", event.target.value)} value={formData.details.desiredDeliveryDate || ""} />

            {isConsulting ? <>
              <Input id="cargoType" label="화물 종류 (선택)" onChange={(event) => updateDetail("cargoType", event.target.value)} value={formData.details.cargoType || ""} />
              <Input id="totalWeight" label="팔레트당 총중량 (선택)" onChange={(event) => updateDetail("totalWeight", event.target.value)} placeholder="예: 1,500kg" value={formData.details.totalWeight || ""} />
              <DimensionInput id="cargoLength" label="화물 길이" onChange={(value) => updateDetail("cargoLength", value)} value={formData.details.cargoLength || ""} />
              <DimensionInput id="cargoWidth" label="화물 너비" onChange={(value) => updateDetail("cargoWidth", value)} value={formData.details.cargoWidth || ""} />
              <DimensionInput id="cargoHeight" label="화물 높이" onChange={(value) => updateDetail("cargoHeight", value)} value={formData.details.cargoHeight || ""} />
              <Select id="usePurpose" label="사용 목적 (선택)" onChange={(event) => updateDetail("usePurpose", event.target.value)} options={usePurposes} value={formData.details.usePurpose || ""} />
              <Select id="forkliftUse" label="지게차 사용 여부 (선택)" onChange={(event) => updateDetail("forkliftUse", event.target.value)} options={yesNoUnknown} value={formData.details.forkliftUse || ""} />
              <Select id="rackUse" label="랙 적재 여부 (선택)" onChange={(event) => updateDetail("rackUse", event.target.value)} options={yesNoUnknown} value={formData.details.rackUse || ""} />
              <Select id="automationUse" label="자동화 설비 사용 여부 (선택)" onChange={(event) => updateDetail("automationUse", event.target.value)} options={yesNoUnknown} value={formData.details.automationUse || ""} />
              <div className="col-span-full min-w-0 rounded-lg border border-[var(--line)]">
                <button aria-controls="advanced-cargo-fields" aria-expanded={advancedOpen} className="flex min-h-14 w-full min-w-0 items-center justify-between gap-3 px-4 text-left font-bold" onClick={() => setAdvancedOpen((current) => !current)} type="button"><span className="min-w-0"><span className="block">상세 조건 추가 입력</span><span className="mt-1 block text-xs font-normal text-[var(--sub-text)]">알고 있는 범위에서만 입력해 주세요.</span></span><span aria-hidden="true" className={`shrink-0 transition ${advancedOpen ? "rotate-180" : ""}`}>⌄</span></button>
                {advancedOpen ? <div className="grid min-w-0 gap-4 border-t border-[var(--line)] p-4 md:grid-cols-2" id="advanced-cargo-fields">{[["loadDistribution", "하중 분포"], ["concentratedLoad", "집중하중 여부"], ["centerOfGravity", "무게중심 위치"], ["stackingLayers", "적재단수"], ["fixationMethod", "제품 고정 방식"], ["currentPallet", "현재 사용 팔레트"], ["currentProblems", "현재 팔레트 문제점"], ["exportCountry", "수출 목적국"], ["containerType", "컨테이너 종류"], ["forkEntry", "포크 진입 방향"], ["forkSpacing", "지게차 포크 간격"], ["handPalletTruckUse", "핸드파레트트럭 사용 여부"], ["rackSupportType", "랙 지지방식"], ["conveyorUse", "컨베이어 사용 여부"], ["storageTemperature", "보관온도"], ["moistureRisk", "습윤 또는 침수 가능성"], ["outdoorStorage", "야외 보관 여부"], ["usageCount", "사용 횟수"], ["reuse", "회수·재사용 여부"]].map(([field, label]) => <Input id={field} key={field} label={`${label} (선택)`} onChange={(event) => updateDetail(field, event.target.value)} value={formData.details[field] || ""} />)}</div> : null}
              </div>
            </> : null}

            <label className="col-span-full flex min-w-0 flex-col" htmlFor="message"><span className="mb-2 flex min-h-6 min-w-0 items-center justify-between gap-3 text-sm font-bold"><span>문의 내용 (선택)</span><span className="shrink-0 font-medium text-[var(--sub-text)]">{formData.message.length} / 1,500자</span></span><textarea aria-describedby={messageError ? "message-error" : undefined} aria-invalid={Boolean(messageError)} className="min-h-40 min-w-0 max-w-full resize-y [overflow-wrap:anywhere] rounded-md border border-[var(--line)] px-4 py-3 text-base leading-7 outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)] aria-invalid:border-[var(--alert)] aria-invalid:focus:border-[var(--alert)] aria-invalid:focus:ring-[rgba(185,92,69,0.16)]" id="message" maxLength={1500} onChange={(event) => updateField("message", event.target.value)} placeholder="추가로 전달할 제품, 규격, 수량, 사용환경 또는 요청자료가 있다면 입력해 주세요." value={formData.message} />{messageError ? <p className="mt-2 text-sm font-bold text-[var(--alert)]" id="message-error">{messageError}</p> : null}</label>

            <h3 className="col-span-full mt-2 border-t border-[var(--line)] pt-6 text-lg font-bold text-[var(--text)]">4. 첨부파일 및 동의</h3>
            <div className="col-span-full min-w-0"><label className="flex min-h-6 items-center text-sm font-bold" htmlFor="attachments">파일 첨부 (선택)</label><input accept="application/pdf,image/jpeg,image/png,image/webp" aria-describedby={attachmentError ? "attachment-error" : "attachment-help"} aria-invalid={Boolean(attachmentError)} className="mt-2 min-h-12 w-full min-w-0 max-w-full rounded-md border border-[var(--line)] px-3 py-2 text-base aria-invalid:border-[var(--alert)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--muted-surface)] file:px-3 file:py-2 file:text-sm" id="attachments" key={attachmentInputKey} multiple onChange={(event) => updateAttachments(event.target.files)} type="file" /><p className="mt-2 text-xs leading-5 text-[var(--sub-text)]" id="attachment-help">PDF, JPG, PNG, WEBP · 최대 3개 · 개당 50MB</p>{attachmentError ? <div className="mt-3 rounded-lg border border-[var(--alert)] bg-[rgba(185,92,69,0.08)] p-4" id="attachment-error" role="alert"><p className="text-sm font-bold leading-6 text-[var(--alert)]">{attachmentError}</p>{showUploadEmailHelp ? <><div className="mt-3 flex min-w-0 items-center gap-2 rounded-md bg-white p-2"><a className="min-w-0 flex-1 truncate font-bold text-[var(--primary)] underline underline-offset-2" href={`mailto:${uploadSupportEmail}`}>{uploadSupportEmail}</a><button className="min-h-10 shrink-0 rounded-md border border-[var(--primary)] px-4 text-sm font-bold text-[var(--primary)]" onClick={() => void copyUploadSupportEmail()} type="button">복사</button></div><p aria-live="polite" className="mt-2 min-h-5 text-xs font-bold text-[var(--primary)]">{uploadEmailCopyMessage}</p></> : null}</div> : null}{attachments.length ? <ul className="mt-3 grid gap-2">{attachments.map((file, index) => <li className="flex min-w-0 items-center gap-3 rounded-md bg-[var(--muted-surface)] px-3 py-2 text-sm" key={`${file.name}-${file.size}`}><span aria-hidden="true" className="shrink-0">📎</span><span className="min-w-0 flex-1"><span className="line-clamp-2 [overflow-wrap:anywhere]">{file.name}</span><span className="mt-0.5 block text-xs text-[var(--sub-text)]">{(file.size / 1024 / 1024).toFixed(2)}MB · {uploading ? "업로드 중" : "업로드 대기"}</span></span><button className="min-h-10 shrink-0 rounded-md px-2 text-sm font-bold text-[var(--alert)]" onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button">삭제</button></li>)}</ul> : null}</div>
            <input aria-hidden="true" className="hidden" onChange={(event) => updateField("website", event.target.value)} tabIndex={-1} value={formData.website} />
          </div>

          <div className={`mt-5 min-w-0 rounded-lg border bg-[var(--muted-surface)] p-4 ${privacyError ? "border-[var(--alert)]" : "border-transparent"}`} id="privacy-details">
            <label className="flex min-w-0 items-start gap-3 text-sm leading-6 text-[var(--sub-text)]"><input aria-describedby={privacyError ? "privacy-error" : undefined} aria-invalid={Boolean(privacyError)} aria-required="true" checked={formData.privacyAgreed} className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]" id="privacyAgreed" onChange={(event) => updateField("privacyAgreed", event.target.checked)} type="checkbox" /><span className="min-w-0">개인정보 수집 및 이용에 동의합니다. (필수)</span></label>
            {privacyError ? <p className="mt-2 text-sm font-bold text-[var(--alert)]" id="privacy-error">{privacyError}</p> : null}
            <details className="mt-3 min-w-0 text-xs leading-6 text-[var(--sub-text)]"><summary className="cursor-pointer font-bold text-[var(--primary)]">수집·이용 내용 보기</summary><div className="mt-2 [overflow-wrap:anywhere]"><p><strong>수집 항목:</strong> 전화번호, 납품 지역 및 사용자가 선택적으로 입력한 회사명·담당자명·이메일·문의 내용·첨부파일·상세정보</p><p><strong>이용 목적:</strong> 문의 확인, 제품 상담, 견적 검토, 자료 제공, 회신 및 고객 응대</p><p><strong>보유기간:</strong> 문의 처리 목적 달성 후 지체 없이 파기하며, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p><p>동의를 거부할 수 있으나 문의 접수가 제한될 수 있습니다.</p></div></details>
            <a className="mt-2 inline-flex text-xs font-bold text-[var(--primary)] underline underline-offset-2" href="/privacy">개인정보처리방침</a>
          </div>

          {validationAttempted && validationFieldOrder.some((field) => currentFieldErrors[field]) ? (
            <div aria-labelledby="validation-summary-title" className="mt-5 rounded-lg border border-[var(--alert)] bg-[rgba(185,92,69,0.08)] p-4" role="alert">
              <p className="font-bold text-[var(--alert)]" id="validation-summary-title">
                아래 항목을 확인해 주세요.
              </p>
              <ul className="mt-2 grid gap-1 text-sm text-[var(--alert)]">
                {validationFieldOrder.map((field) => {
                  const fieldError = currentFieldErrors[field];
                  return fieldError ? (
                    <li key={field}>
                      <button className="min-h-9 text-left font-bold underline underline-offset-2" onClick={() => focusValidationField(field)} type="button">
                        {fieldError}
                      </button>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          ) : null}

          {error ? <p aria-live="polite" className="mt-5 max-w-full [overflow-wrap:anywhere] rounded-lg border border-[var(--alert)] bg-[rgba(185,92,69,0.12)] p-4 text-sm font-bold text-[var(--alert)]">{error}</p> : null}
          {success ? <p aria-live="polite" className="mt-5 max-w-full [overflow-wrap:anywhere] rounded-md bg-[var(--sub-mint)] p-4 text-sm font-bold text-[var(--primary-dark)]">{success}</p> : null}
          <div className="mt-6 flex justify-center"><Button className="w-full sm:min-w-48 sm:w-auto" disabled={isLoading} type="submit">{uploading ? "첨부파일 업로드 중..." : isLoading ? "접수 중..." : submitLabel(formData.inquiryType)}</Button></div>
        </form>
      </div>
    </section>
  );
}
