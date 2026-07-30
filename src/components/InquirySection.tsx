"use client";

import { Check, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CatalogDownload from "@/components/CatalogDownload";
import {
  type ContactFormData,
  deliveryRegionOptions,
  estimatedQuantityOptions,
  getContactFormFieldErrors,
  initialContactFormData,
  inquiryTypes,
  inquiryTypeLabel,
  palletSizeOptions,
  submitLabel,
} from "@/lib/contactSchema";
import { productInterestOptions } from "@/lib/constants";
import { trackEvent } from "@/lib/trackEvent";

const maxAttachmentBytes = 50 * 1024 * 1024;
const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".zip"];
const typeGuidance: Record<
  Exclude<ContactFormData["inquiryType"], "">,
  { time: string; fields: string; attachment: string }
> = {
  product: {
    time: "약 1~2분",
    fields: "전화번호와 궁금한 제품",
    attachment: "현재 사용 제품 사진",
  },
  quote: {
    time: "약 2~3분",
    fields: "전화번호, 납품 지역, 예상 수량",
    attachment: "규격서 또는 도면",
  },
  consulting: {
    time: "약 3~5분",
    fields: "화물 중량·크기와 사용설비",
    attachment: "화물·설비 사진 또는 도면",
  },
  other: {
    time: "약 1~2분",
    fields: "전화번호와 필요한 자료",
    attachment: "검토 중인 문서",
  },
};

function fieldClass(invalid = false) {
  return `min-h-12 w-full border bg-white px-4 text-base outline-none transition focus:ring-4 ${
    invalid
      ? "border-[var(--alert)] focus:border-[var(--alert)] focus:ring-[rgba(185,92,69,.12)]"
      : "border-[var(--line)] focus:border-[var(--primary)] focus:ring-[rgba(46,92,69,.12)]"
  }`;
}

export default function InquirySection({
  phone = "",
  email = "",
}: {
  phone?: string;
  email?: string;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContactFormData>(
    initialContactFormData,
  );
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [submittedType, setSubmittedType] = useState("");
  const [validationAttempted, setValidationAttempted] = useState(false);

  useEffect(() => {
    const prefill = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          inquiryType?: ContactFormData["inquiryType"];
          usePurpose?: string;
          exportUse?: string;
        }>
      ).detail;
      setFormData((current) => ({
        ...current,
        inquiryType: detail.inquiryType || current.inquiryType,
        details: {
          ...current.details,
          ...(detail.usePurpose ? { usePurpose: detail.usePurpose } : {}),
          ...(detail.exportUse ? { exportUse: detail.exportUse } : {}),
        },
      }));
      setStep(1);
    };
    window.addEventListener("adson:inquiry-prefill", prefill);
    return () => window.removeEventListener("adson:inquiry-prefill", prefill);
  }, []);

  function updateField<K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K],
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function updateDetail(field: string, value: string) {
    setFormData((current) => ({
      ...current,
      details: { ...current.details, [field]: value },
    }));
    setError("");
  }

  function goNext() {
    if (step === 1 && !formData.inquiryType) {
      setValidationAttempted(true);
      document.getElementById("inquiry-type-field")?.focus();
      return;
    }
    if (step === 2) {
      const errors = getContactFormFieldErrors({
        ...formData,
        privacyAgreed: true,
        details: {
          ...formData.details,
          deliveryRegion:
            formData.details.deliveryRegion ||
            (formData.inquiryType === "quote" ||
            formData.inquiryType === "consulting"
              ? ""
              : deliveryRegionOptions[0]),
        },
      });
      if (errors.phone || errors.email || errors.responseMethod) {
        setValidationAttempted(true);
        document
          .getElementById(
            errors.phone ? "phone" : errors.email ? "email" : "responseMethod",
          )
          ?.focus();
        return;
      }
    }
    setValidationAttempted(false);
    setStep((current) => Math.min(4, current + 1));
    document.getElementById("inquiry-form-title")?.focus();
  }

  function addFiles(files: FileList | null) {
    const next = Array.from(files || []);
    const unsupported = next.find(
      (file) =>
        !allowedExtensions.some((extension) =>
          file.name.toLowerCase().endsWith(extension),
        ),
    );
    const tooLarge = next.find((file) => file.size > maxAttachmentBytes);
    if (attachments.length + next.length > 3) {
      setAttachmentError("첨부파일은 최대 3개까지 선택할 수 있습니다.");
      return;
    }
    if (unsupported) {
      setAttachmentError("PDF, JPG, PNG, WEBP, ZIP 파일만 첨부할 수 있습니다.");
      return;
    }
    if (tooLarge) {
      setAttachmentError(
        `파일당 50MB까지 업로드할 수 있습니다.${email ? ` 대용량 자료는 ${email}로 보내 주세요.` : ""}`,
      );
      return;
    }
    setAttachments((current) => [...current, ...next]);
    setAttachmentError("");
    trackEvent("inquiry_file_upload", { file_count: next.length });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4 || loading) return;
    const errors = getContactFormFieldErrors(formData);
    if (Object.keys(errors).length) {
      setValidationAttempted(true);
      setError("필수 입력 항목을 확인해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        inquiryId?: string;
        registrationNumber?: string;
      };
      if (!response.ok || !result.success || !result.registrationNumber) {
        throw new Error(result.message || "문의 접수 중 문제가 발생했습니다.");
      }
      if (attachments.length && result.inquiryId) {
        const body = new FormData();
        attachments.forEach((file) => body.append("files", file));
        const uploadResponse = await fetch(
          `/api/contact/${result.inquiryId}/attachments`,
          { method: "POST", body },
        );
        if (!uploadResponse.ok) {
          setAttachmentError(
            "문의는 접수되었지만 첨부파일은 저장되지 않았습니다. 담당자 연락 시 전달해 주세요.",
          );
        }
      }
      setSubmittedType(inquiryTypeLabel(formData.inquiryType));
      setRegistrationNumber(result.registrationNumber);
      trackEvent("inquiry_submit_success", {
        inquiry_type: formData.inquiryType,
        attachment_count: attachments.length,
      });
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "문의 접수 중 문제가 발생했습니다.";
      setError(message);
      trackEvent("inquiry_submit_error", {
        inquiry_type: formData.inquiryType,
      });
    } finally {
      setLoading(false);
    }
  }

  const currentErrors = validationAttempted
    ? getContactFormFieldErrors(formData)
    : {};
  const requiresRegion =
    formData.inquiryType === "quote" || formData.inquiryType === "consulting";
  const guidance = formData.inquiryType
    ? typeGuidance[formData.inquiryType]
    : null;
  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : "";

  return (
    <section
      className="bg-[var(--primary-dark)] px-5 py-16 lg:px-8 lg:py-24"
      id="inquiry"
    >
      <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[0.35fr_0.65fr] lg:gap-12">
        <div className="order-2 lg:order-1">
          <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold)]">
            Inquiry
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white lg:text-4xl">
            견적 및 문의
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            문의 유형에 맞는 항목만 작성해 주세요. 담당자가 문의 내용을 확인한
            후 연락드립니다.
          </p>

          <div className="mt-8 border border-white/12 bg-white/[0.05] p-5">
            <strong className="text-sm text-[var(--accent-gold)]">
              상담 안내
            </strong>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-white/72">
              {[
                "화물·설비 조건 기반 적용 검토",
                "도면과 현장사진 첨부 가능",
                "전화·문자·이메일 중 가능한 방식으로 연락",
              ].map((item) => (
                <li className="flex gap-3" key={item}>
                  <Check
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-[var(--accent-gold)]"
                    size={16}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border border-[var(--accent-gold)] p-5 text-white">
            <FileText
              aria-hidden="true"
              className="text-[var(--accent-gold)]"
              size={22}
            />
            <strong className="mt-4 block">제품 카탈로그</strong>
            <p className="mt-2 text-sm text-white/65">
              제품 규격과 주요 특징을 확인해보세요.
            </p>
            <p className="mt-1 text-xs text-white/50">PDF · 약 2.7MB</p>
            <div className="mt-4">
              <CatalogDownload compact location="inquiry" />
            </div>
          </div>

          {phoneHref ? (
            <a
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 border border-white/30 bg-white px-4 font-extrabold text-[var(--primary-deep)]"
              href={phoneHref}
              onClick={() => trackEvent("phone_click", { location: "inquiry" })}
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
              <span>전화 상담하기</span>
              <span className="hidden md:inline">· {phone}</span>
            </a>
          ) : null}
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          {registrationNumber ? (
            <div
              aria-live="polite"
              className="bg-white p-6 sm:p-10"
              role="status"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sub-mint)] text-[var(--primary)]">
                <Check aria-hidden="true" size={24} />
              </span>
              <h3 className="mt-6 text-2xl font-extrabold">
                문의가 정상적으로 접수되었습니다.
              </h3>
              <div className="mt-6 border-y border-[var(--line)] py-5">
                <p className="text-xs font-bold text-[var(--sub-text)]">
                  접수번호
                </p>
                <p className="number mt-1 text-3xl font-bold text-[var(--primary-dark)]">
                  {registrationNumber}
                </p>
                <p className="mt-2 text-sm text-[var(--sub-text)]">
                  {submittedType}
                </p>
              </div>
              <ol className="mt-6 grid gap-3 text-sm text-[var(--sub-text)]">
                <li>1. 문의 내용 확인</li>
                <li>2. 담당자 배정</li>
                <li>3. 전화·문자·이메일 중 가능한 방식으로 연락</li>
              </ol>
              <p className="mt-5 text-sm font-bold">
                담당자가 문의 내용을 확인한 후 연락드립니다.
              </p>
              {attachmentError ? (
                <p className="mt-4 text-sm font-bold text-[var(--alert)]">
                  {attachmentError}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  className="min-h-12 border border-[var(--primary)] px-4 font-bold text-[var(--primary)]"
                  onClick={() => setRegistrationNumber("")}
                  type="button"
                >
                  접수 내용 확인
                </button>
                <a
                  className="inline-flex min-h-12 items-center border border-[var(--line)] px-4 font-bold"
                  href="/documents"
                >
                  제품 자료 보기
                </a>
                <Link
                  className="inline-flex min-h-12 items-center bg-[var(--primary)] px-4 font-bold text-white"
                  href="/"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          ) : (
            <form
              className="min-w-0 bg-white p-5 sm:p-8"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
                <h3
                  className="text-lg font-extrabold outline-none"
                  id="inquiry-form-title"
                  tabIndex={-1}
                >
                  {step} / 4{" "}
                  {
                    ["문의 유형", "기본 정보", "상세 조건", "첨부파일 및 동의"][
                      step - 1
                    ]
                  }
                </h3>
                <div
                  aria-label={`문의 작성 ${step}단계`}
                  className="flex gap-1"
                  role="progressbar"
                  aria-valuemax={4}
                  aria-valuemin={1}
                  aria-valuenow={step}
                >
                  {[1, 2, 3, 4].map((value) => (
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-8 ${
                        value <= step
                          ? "bg-[var(--primary)]"
                          : "bg-[var(--line)]"
                      }`}
                      key={value}
                    />
                  ))}
                </div>
              </div>

              {step === 1 ? (
                <fieldset
                  aria-describedby={
                    currentErrors.inquiryType ? "inquiry-type-error" : undefined
                  }
                  className="mt-6"
                  id="inquiry-type-field"
                  tabIndex={-1}
                >
                  <legend className="text-sm font-bold">
                    문의 유형을 선택해 주세요. (필수)
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {inquiryTypes.map((item) => {
                      const selected = formData.inquiryType === item.value;
                      return (
                        <button
                          aria-pressed={selected}
                          className={`min-h-32 border p-4 text-left transition ${
                            selected
                              ? "border-[var(--primary)] bg-[var(--sub-mint)]"
                              : "border-[var(--line)] hover:border-[var(--primary)]"
                          }`}
                          key={item.value}
                          onClick={() => {
                            updateField("inquiryType", item.value);
                            setValidationAttempted(false);
                            trackEvent("inquiry_type_select", {
                              inquiry_type: item.value,
                            });
                            trackEvent("inquiry_start", {
                              inquiry_type: item.value,
                            });
                          }}
                          type="button"
                        >
                          <strong className="block">{item.label}</strong>
                          <span className="mt-2 block text-xs leading-5 text-[var(--sub-text)]">
                            {item.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {currentErrors.inquiryType ? (
                    <p
                      className="mt-2 text-sm font-bold text-[var(--alert)]"
                      id="inquiry-type-error"
                    >
                      {currentErrors.inquiryType}
                    </p>
                  ) : null}
                  {guidance ? (
                    <div className="mt-5 grid gap-3 bg-[var(--muted-surface)] p-4 text-sm sm:grid-cols-3">
                      <p>
                        <strong className="block">필요한 입력</strong>
                        <span className="mt-1 block text-[var(--sub-text)]">
                          {guidance.fields}
                        </span>
                      </p>
                      <p>
                        <strong className="block">예상 작성 시간</strong>
                        <span className="mt-1 block text-[var(--sub-text)]">
                          {guidance.time}
                        </span>
                      </p>
                      <p>
                        <strong className="block">도움이 되는 자료</strong>
                        <span className="mt-1 block text-[var(--sub-text)]">
                          {guidance.attachment}
                        </span>
                      </p>
                    </div>
                  ) : null}
                </fieldset>
              ) : null}

              {step === 2 ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2" htmlFor="phone">
                    <span className="text-sm font-bold">전화번호 (필수)</span>
                    <input
                      aria-describedby={
                        currentErrors.phone ? "phone-error" : undefined
                      }
                      aria-invalid={Boolean(currentErrors.phone)}
                      className={fieldClass(Boolean(currentErrors.phone))}
                      id="phone"
                      inputMode="tel"
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      type="tel"
                      value={formData.phone}
                    />
                    {currentErrors.phone ? (
                      <span
                        className="text-sm font-bold text-[var(--alert)]"
                        id="phone-error"
                      >
                        {currentErrors.phone}
                      </span>
                    ) : null}
                  </label>
                  <label className="grid gap-2" htmlFor="email">
                    <span className="text-sm font-bold">이메일 (선택)</span>
                    <input
                      aria-describedby={
                        currentErrors.email ? "email-error" : undefined
                      }
                      aria-invalid={Boolean(currentErrors.email)}
                      className={fieldClass(Boolean(currentErrors.email))}
                      id="email"
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      type="email"
                      value={formData.email}
                    />
                    {currentErrors.email ? (
                      <span
                        className="text-sm font-bold text-[var(--alert)]"
                        id="email-error"
                      >
                        {currentErrors.email}
                      </span>
                    ) : null}
                  </label>
                  <label className="grid gap-2" htmlFor="companyName">
                    <span className="text-sm font-bold">회사명 (선택)</span>
                    <input
                      className={fieldClass()}
                      id="companyName"
                      onChange={(event) =>
                        updateField("companyName", event.target.value)
                      }
                      value={formData.companyName}
                    />
                  </label>
                  <label className="grid gap-2" htmlFor="contactPerson">
                    <span className="text-sm font-bold">담당자명 (선택)</span>
                    <input
                      className={fieldClass()}
                      id="contactPerson"
                      onChange={(event) =>
                        updateField("contactPerson", event.target.value)
                      }
                      value={formData.contactPerson}
                    />
                  </label>
                  <fieldset className="sm:col-span-2" id="responseMethod">
                    <legend className="text-sm font-bold">
                      연락 선호 방식
                    </legend>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        ["EMAIL", "이메일"],
                        ["PHONE", "전화"],
                        ["TEXT", "문자"],
                        ["ANY", "상관없음"],
                      ].map(([value, label]) => (
                        <button
                          aria-pressed={formData.responseMethod === value}
                          className={`min-h-12 border px-3 text-sm font-bold ${
                            formData.responseMethod === value
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--line)]"
                          }`}
                          key={value}
                          onClick={() =>
                            updateField(
                              "responseMethod",
                              value as ContactFormData["responseMethod"],
                            )
                          }
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {requiresRegion ? (
                    <label className="grid gap-2" htmlFor="deliveryRegion">
                      <span className="text-sm font-bold">납품 지역 (필수)</span>
                      <select
                        aria-describedby={
                          currentErrors.deliveryRegion
                            ? "delivery-region-error"
                            : undefined
                        }
                        aria-invalid={Boolean(currentErrors.deliveryRegion)}
                        className={fieldClass(
                          Boolean(currentErrors.deliveryRegion),
                        )}
                        id="deliveryRegion"
                        onChange={(event) =>
                          updateDetail("deliveryRegion", event.target.value)
                        }
                        value={formData.details.deliveryRegion || ""}
                      >
                        <option value="">선택해 주세요</option>
                        {deliveryRegionOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                      {currentErrors.deliveryRegion ? (
                        <span
                          className="text-sm font-bold text-[var(--alert)]"
                          id="delivery-region-error"
                        >
                          {currentErrors.deliveryRegion}
                        </span>
                      ) : null}
                    </label>
                  ) : null}
                  <label className="grid gap-2" htmlFor="productInterest">
                    <span className="text-sm font-bold">관심 제품 (선택)</span>
                    <select
                      className={fieldClass()}
                      id="productInterest"
                      onChange={(event) =>
                        updateField("productInterest", event.target.value)
                      }
                      value={formData.productInterest}
                    >
                      <option value="">선택해 주세요</option>
                      {productInterestOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2" htmlFor="estimatedQuantity">
                    <span className="text-sm font-bold">예상 수량 (선택)</span>
                    <select
                      className={fieldClass()}
                      id="estimatedQuantity"
                      onChange={(event) =>
                        updateField("estimatedQuantity", event.target.value)
                      }
                      value={formData.estimatedQuantity}
                    >
                      <option value="">선택해 주세요</option>
                      {estimatedQuantityOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  {formData.inquiryType !== "other" ? (
                    <label className="grid gap-2" htmlFor="palletSize">
                      <span className="text-sm font-bold">
                        희망 규격 (선택)
                      </span>
                      <select
                        className={fieldClass()}
                        id="palletSize"
                        onChange={(event) =>
                          updateField(
                            "requestedPalletSizes",
                            event.target.value ? [event.target.value] : [],
                          )
                        }
                        value={formData.requestedPalletSizes[0] || ""}
                      >
                        <option value="">잘 모르겠음</option>
                        {palletSizeOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {formData.inquiryType === "consulting" ? (
                    <>
                      <label className="grid gap-2" htmlFor="cargoType">
                        <span className="text-sm font-bold">
                          화물 형태 (선택)
                        </span>
                        <input
                          className={fieldClass()}
                          id="cargoType"
                          onChange={(event) =>
                            updateDetail("cargoType", event.target.value)
                          }
                          value={formData.details.cargoType || ""}
                        />
                      </label>
                      <label className="grid gap-2" htmlFor="totalWeight">
                        <span className="text-sm font-bold">
                          팔레트당 중량 (선택)
                        </span>
                        <input
                          className={fieldClass()}
                          id="totalWeight"
                          onChange={(event) =>
                            updateDetail("totalWeight", event.target.value)
                          }
                          placeholder="예: 1,500kg"
                          value={formData.details.totalWeight || ""}
                        />
                      </label>
                      <label className="grid gap-2" htmlFor="usePurpose">
                        <span className="text-sm font-bold">
                          사용 목적 (선택)
                        </span>
                        <input
                          className={fieldClass()}
                          id="usePurpose"
                          onChange={(event) =>
                            updateDetail("usePurpose", event.target.value)
                          }
                          value={formData.details.usePurpose || ""}
                        />
                      </label>
                      <label className="grid gap-2" htmlFor="equipment">
                        <span className="text-sm font-bold">
                          사용 설비 (선택)
                        </span>
                        <input
                          className={fieldClass()}
                          id="equipment"
                          onChange={(event) =>
                            updateDetail("equipment", event.target.value)
                          }
                          placeholder="랙, 컨베이어, 지게차 등"
                          value={formData.details.equipment || ""}
                        />
                      </label>
                    </>
                  ) : null}
                  <label
                    className="grid gap-2 sm:col-span-2"
                    htmlFor="message"
                  >
                    <span className="flex justify-between gap-3 text-sm font-bold">
                      문의 내용 (선택)
                      <span className="font-normal text-[var(--sub-text)]">
                        {formData.message.length} / 1,500자
                      </span>
                    </span>
                    <textarea
                      className={`${fieldClass()} min-h-36 py-3`}
                      id="message"
                      maxLength={1500}
                      onChange={(event) =>
                        updateField("message", event.target.value)
                      }
                      value={formData.message}
                    />
                  </label>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="mt-6 grid gap-6">
                  <div>
                    <label className="text-sm font-bold" htmlFor="attachments">
                      파일 첨부 (선택)
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.zip"
                      className={`${fieldClass()} mt-2 py-2 file:mr-3 file:border-0 file:bg-[var(--muted-surface)] file:px-3 file:py-2`}
                      id="attachments"
                      multiple
                      onChange={(event) => addFiles(event.target.files)}
                      type="file"
                    />
                    <p className="mt-2 text-xs leading-5 text-[var(--sub-text)]">
                      PDF, JPG, PNG, WEBP, ZIP · 최대 3개 · 개당 50MB
                    </p>
                    {attachmentError ? (
                      <p
                        className="mt-2 text-sm font-bold text-[var(--alert)]"
                        role="alert"
                      >
                        {attachmentError}
                      </p>
                    ) : null}
                    {attachments.length ? (
                      <ul className="mt-3 grid gap-2">
                        {attachments.map((file, index) => (
                          <li
                            className="flex items-center justify-between gap-3 bg-[var(--muted-surface)] px-3 py-2 text-sm"
                            key={`${file.name}-${file.size}`}
                          >
                            <span className="min-w-0 truncate">{file.name}</span>
                            <button
                              className="min-h-10 shrink-0 px-2 font-bold text-[var(--alert)]"
                              onClick={() =>
                                setAttachments((current) =>
                                  current.filter(
                                    (_, currentIndex) => currentIndex !== index,
                                  ),
                                )
                              }
                              type="button"
                            >
                              삭제
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div
                    className={`border p-4 ${
                      currentErrors.privacyAgreed
                        ? "border-[var(--alert)]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    <label className="flex items-start gap-3 text-sm leading-6">
                      <input
                        aria-describedby={
                          currentErrors.privacyAgreed
                            ? "privacy-error"
                            : undefined
                        }
                        checked={formData.privacyAgreed}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                        id="privacyAgreed"
                        onChange={(event) =>
                          updateField("privacyAgreed", event.target.checked)
                        }
                        type="checkbox"
                      />
                      개인정보 수집 및 이용에 동의합니다. (필수)
                    </label>
                    <p className="mt-3 text-xs leading-6 text-[var(--sub-text)]">
                      문의 확인 및 회신, 견적·기술 상담, 상담 이력 관리, 재문의
                      대응과 고객관리를 위해 입력정보를 이용합니다. 자세한 내용은{" "}
                      <a className="font-bold underline" href="/privacy">
                        개인정보처리방침
                      </a>
                      에서 확인할 수 있습니다.
                    </p>
                    {currentErrors.privacyAgreed ? (
                      <p
                        className="mt-2 text-sm font-bold text-[var(--alert)]"
                        id="privacy-error"
                      >
                        {currentErrors.privacyAgreed}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {error ? (
                <div
                  className="mt-5 border border-[var(--alert)] bg-[rgba(185,92,69,.08)] p-4 text-sm font-bold text-[var(--alert)]"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <div className="mt-7 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    className="inline-flex min-h-12 items-center gap-2 border border-[var(--line)] px-4 font-bold"
                    onClick={() => {
                      setStep((current) => Math.max(1, current - 1));
                      setValidationAttempted(false);
                    }}
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" size={18} />
                    이전
                  </button>
                ) : (
                  <span />
                )}
                {step < 4 ? (
                  <button
                    className="inline-flex min-h-12 items-center gap-2 bg-[var(--primary)] px-5 font-extrabold text-white"
                    onClick={goNext}
                    type="button"
                  >
                    다음
                    <ChevronRight aria-hidden="true" size={18} />
                  </button>
                ) : (
                  <button
                    className="min-h-12 bg-[var(--primary)] px-6 font-extrabold text-white disabled:opacity-60"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? "접수 중..." : submitLabel(formData.inquiryType)}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
