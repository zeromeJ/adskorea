"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SectionTitle from "@/components/ui/SectionTitle";
import { productInterestOptions } from "@/lib/constants";
import {
  ContactFormData,
  initialContactFormData,
  inquiryTypes,
  inquiryTypeLabel,
  isValidPhone,
  submitLabel,
  validateContactForm,
} from "@/lib/contactSchema";

const usePurposes = ["보관", "국내 운송", "수출 운송", "랙 적재", "자동화 설비", "기타"];
const yesNoUnknown = ["예", "아니오", "미정"];

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

export default function InquirySection({ phoneHref = "" }: { phoneHref?: string }) {
  const [formData, setFormData] = useState<ContactFormData>(initialContactFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
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

  function updateAttachments(files: FileList | null) {
    const nextFiles = Array.from(files ?? []);
    const invalid = nextFiles.find((file) => !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024);
    if (attachments.length + nextFiles.length > 3 || invalid) {
      setError("PDF, JPG, PNG, WEBP 파일만 최대 3개, 개당 10MB까지 첨부할 수 있습니다.");
      setAttachmentInputKey((current) => current + 1);
      return;
    }
    setAttachments((current) => [...current, ...nextFiles]);
    setAttachmentInputKey((current) => current + 1);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    const validationMessage = validateContactForm(formData);
    if (validationMessage) {
      setPhoneTouched(true);
      setError(validationMessage);
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
        if (!uploadResponse.ok) attachmentWarning = " 첨부파일은 저장되지 않았으니 회신 시 전달해 주세요.";
      }
      setSuccess(`접수번호 ${result.inquiryId} · ${inquiryTypeLabel(formData.inquiryType)} 접수가 완료되었습니다.${attachmentWarning}`);
      setFormData(initialContactFormData);
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

  const isQuote = formData.inquiryType === "quote";
  const isConsulting = formData.inquiryType === "consulting";

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
          {phoneHref ? <LinkButton className="mt-3 w-full" href={phoneHref} variant="light">전화하기</LinkButton> : null}
        </div>

        <form className="min-w-0 max-w-full rounded-lg bg-white p-5 sm:p-8" noValidate onSubmit={handleSubmit}>
          <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 md:[&>*]:min-w-0">
            <h3 className="col-span-full text-lg font-bold text-[var(--text)]">1. 문의 유형</h3>
            <fieldset className="col-span-full min-w-0">
              <legend className="mb-2 flex min-h-6 items-center text-sm font-bold text-[var(--text)]">문의 유형 (필수)</legend>
              <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                {inquiryTypes.map((item) => {
                  const selected = formData.inquiryType === item.value;
                  return (
                    <button
                      aria-pressed={selected}
                      className={`flex min-h-24 min-w-0 items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${selected ? "border-[var(--primary)] bg-[var(--sub-mint)]" : "border-[var(--line)] bg-white hover:border-[var(--primary)]"}`}
                      key={item.value}
                      onClick={() => updateField("inquiryType", item.value)}
                      type="button"
                    >
                      <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--sub-sage)]"}`}>{selected ? "✓" : ""}</span>
                      <span className="min-w-0"><strong className="block [overflow-wrap:anywhere] text-sm text-[var(--text)]">{item.label}</strong><span className="mt-1 block [overflow-wrap:anywhere] text-xs leading-5 text-[var(--sub-text)]">{item.description}</span></span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <h3 className="col-span-full mt-2 border-t border-[var(--line)] pt-6 text-lg font-bold text-[var(--text)]">2. 기본 정보</h3>
            <Input aria-required="true" id="companyName" label="회사명 (필수)" onChange={(event) => updateField("companyName", event.target.value)} required value={formData.companyName} />
            <Input aria-required="true" id="contactPerson" label="담당자명 (필수)" onChange={(event) => updateField("contactPerson", event.target.value)} required value={formData.contactPerson} />
            <div className="flex min-w-0 flex-col">
              <Input aria-describedby="phone-error" aria-invalid={phoneTouched && formData.phone.length > 0 ? !isValidPhone(formData.phone) : undefined} aria-required="true" id="phone" inputMode="tel" label="연락처 (필수)" maxLength={30} onBlur={() => setPhoneTouched(true)} onChange={(event) => updateField("phone", event.target.value)} placeholder="연락 가능한 번호를 입력해 주세요" required type="tel" value={formData.phone} />
              <p className="mt-2 min-h-5 text-sm font-bold text-[var(--alert)]" id="phone-error">{phoneTouched && formData.phone && !isValidPhone(formData.phone) ? "전화번호 형식을 확인해 주세요. 국가번호도 입력할 수 있습니다." : ""}</p>
            </div>
            <Input autoComplete="email" id="email" label="이메일 (선택)" maxLength={254} onChange={(event) => updateField("email", event.target.value)} placeholder="name@company.com" type="email" value={formData.email} />
            <fieldset className="col-span-full min-w-0"><legend className="mb-2 flex min-h-6 items-center text-sm font-bold">연락 선호 방식 (선택)</legend><div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">{[{ value: "EMAIL", label: "이메일" }, { value: "PHONE", label: "전화" }, { value: "TEXT", label: "문자" }, { value: "ANY", label: "상관없음" }].map((option) => { const selected = formData.responseMethod === option.value; return <button aria-pressed={selected} className={`inline-flex min-h-12 min-w-0 items-center justify-center rounded-lg border px-3 text-sm font-bold transition ${selected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--line)] bg-white text-[var(--text)] hover:border-[var(--primary)]"}`} key={option.value} onClick={() => updateField("responseMethod", option.value as ContactFormData["responseMethod"])} type="button">{option.label}</button>; })}</div></fieldset>

            <h3 className="col-span-full mt-2 border-t border-[var(--line)] pt-6 text-lg font-bold text-[var(--text)]">3. 문의 상세</h3>
            <Select containerClassName="col-span-full md:col-span-1" id="productInterest" label={`관심 제품 (${isQuote ? "필수" : "선택"})`} onChange={(event) => updateField("productInterest", event.target.value)} options={productInterestOptions} required={isQuote} value={formData.productInterest} />

            {isQuote ? <>
              <Input aria-required="true" id="requiredPalletSize" label="필요한 팔레트 규격 (필수)" onChange={(event) => updateDetail("requiredPalletSize", event.target.value)} placeholder="예: 1200 × 1000mm" required value={formData.details.requiredPalletSize || ""} />
              <Input aria-required="true" id="estimatedQuantity" label="예상 수량 (필수)" onChange={(event) => updateField("estimatedQuantity", event.target.value)} required value={formData.estimatedQuantity} />
              <Input aria-required="true" id="deliveryRegion" label="납품 지역 또는 국가 (필수)" onChange={(event) => updateDetail("deliveryRegion", event.target.value)} required value={formData.details.deliveryRegion || ""} />
              <Input id="desiredDeliveryDate" label="희망 납기 (선택)" onChange={(event) => updateDetail("desiredDeliveryDate", event.target.value)} value={formData.details.desiredDeliveryDate || ""} />
              <Select id="exportUse" label="수출용 여부 (선택)" onChange={(event) => updateDetail("exportUse", event.target.value)} options={yesNoUnknown} value={formData.details.exportUse || ""} />
            </> : null}

            {isConsulting ? <>
              <Input id="cargoType" label="화물 종류 (선택)" onChange={(event) => updateDetail("cargoType", event.target.value)} value={formData.details.cargoType || ""} />
              <Input id="totalWeight" label="팔레트당 총중량 (선택)" onChange={(event) => updateDetail("totalWeight", event.target.value)} placeholder="예: 1,500kg" value={formData.details.totalWeight || ""} />
              <DimensionInput id="cargoLength" label="화물 길이" onChange={(value) => updateDetail("cargoLength", value)} value={formData.details.cargoLength || ""} />
              <DimensionInput id="cargoWidth" label="화물 너비" onChange={(value) => updateDetail("cargoWidth", value)} value={formData.details.cargoWidth || ""} />
              <DimensionInput id="cargoHeight" label="화물 높이" onChange={(value) => updateDetail("cargoHeight", value)} value={formData.details.cargoHeight || ""} />
              <Select id="usePurpose" label="사용 목적 (선택)" onChange={(event) => updateDetail("usePurpose", event.target.value)} options={usePurposes} value={formData.details.usePurpose || ""} />
              <Input id="consultingQuantity" label="예상 수량 (선택)" onChange={(event) => updateField("estimatedQuantity", event.target.value)} value={formData.estimatedQuantity} />
              <Select id="forkliftUse" label="지게차 사용 여부 (선택)" onChange={(event) => updateDetail("forkliftUse", event.target.value)} options={yesNoUnknown} value={formData.details.forkliftUse || ""} />
              <Select id="rackUse" label="랙 적재 여부 (선택)" onChange={(event) => updateDetail("rackUse", event.target.value)} options={yesNoUnknown} value={formData.details.rackUse || ""} />
              <Select id="automationUse" label="자동화 설비 사용 여부 (선택)" onChange={(event) => updateDetail("automationUse", event.target.value)} options={yesNoUnknown} value={formData.details.automationUse || ""} />
              <div className="col-span-full min-w-0 rounded-lg border border-[var(--line)]">
                <button aria-controls="advanced-cargo-fields" aria-expanded={advancedOpen} className="flex min-h-14 w-full min-w-0 items-center justify-between gap-3 px-4 text-left font-bold" onClick={() => setAdvancedOpen((current) => !current)} type="button"><span className="min-w-0"><span className="block">상세 조건 추가 입력</span><span className="mt-1 block text-xs font-normal text-[var(--sub-text)]">알고 있는 범위에서만 입력해 주세요.</span></span><span aria-hidden="true" className={`shrink-0 transition ${advancedOpen ? "rotate-180" : ""}`}>⌄</span></button>
                {advancedOpen ? <div className="grid min-w-0 gap-4 border-t border-[var(--line)] p-4 md:grid-cols-2" id="advanced-cargo-fields">{[["loadDistribution", "하중 분포"], ["concentratedLoad", "집중하중 여부"], ["centerOfGravity", "무게중심 위치"], ["stackingLayers", "적재단수"], ["fixationMethod", "제품 고정 방식"], ["currentPallet", "현재 사용 팔레트"], ["currentProblems", "현재 팔레트 문제점"], ["exportCountry", "수출 목적국"], ["containerType", "컨테이너 종류"], ["forkEntry", "포크 진입 방향"], ["forkSpacing", "지게차 포크 간격"], ["handPalletTruckUse", "핸드파레트트럭 사용 여부"], ["rackSupportType", "랙 지지방식"], ["conveyorUse", "컨베이어 사용 여부"], ["storageTemperature", "보관온도"], ["moistureRisk", "습윤 또는 침수 가능성"], ["outdoorStorage", "야외 보관 여부"], ["usageCount", "사용 횟수"], ["reuse", "회수·재사용 여부"]].map(([field, label]) => <Input id={field} key={field} label={`${label} (선택)`} onChange={(event) => updateDetail(field, event.target.value)} value={formData.details[field] || ""} />)}</div> : null}
              </div>
            </> : null}

            <label className="col-span-full flex min-w-0 flex-col" htmlFor="message"><span className="mb-2 flex min-h-6 min-w-0 items-center justify-between gap-3 text-sm font-bold"><span>문의 내용 (선택)</span><span className="shrink-0 font-medium text-[var(--sub-text)]">{formData.message.length} / 1,500자</span></span><textarea className="min-h-40 min-w-0 max-w-full resize-y [overflow-wrap:anywhere] rounded-md border border-[var(--line)] px-4 py-3 text-base leading-7 outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)]" id="message" maxLength={1500} onChange={(event) => updateField("message", event.target.value)} placeholder="추가로 전달할 제품, 규격, 수량, 사용환경 또는 요청자료가 있다면 입력해 주세요." value={formData.message} /></label>

            <h3 className="col-span-full mt-2 border-t border-[var(--line)] pt-6 text-lg font-bold text-[var(--text)]">4. 첨부파일 및 동의</h3>
            <div className="col-span-full min-w-0"><label className="flex min-h-6 items-center text-sm font-bold" htmlFor="attachments">파일 첨부 (선택)</label><input accept="application/pdf,image/jpeg,image/png,image/webp" className="mt-2 min-h-12 w-full min-w-0 max-w-full rounded-md border border-[var(--line)] px-3 py-2 text-base file:mr-3 file:rounded-md file:border-0 file:bg-[var(--muted-surface)] file:px-3 file:py-2 file:text-sm" id="attachments" key={attachmentInputKey} multiple onChange={(event) => updateAttachments(event.target.files)} type="file" /><p className="mt-2 text-xs leading-5 text-[var(--sub-text)]">PDF, JPG, PNG, WEBP · 최대 3개 · 개당 10MB</p>{attachments.length ? <ul className="mt-3 grid gap-2">{attachments.map((file, index) => <li className="flex min-w-0 items-center gap-3 rounded-md bg-[var(--muted-surface)] px-3 py-2 text-sm" key={`${file.name}-${file.size}`}><span aria-hidden="true" className="shrink-0">📎</span><span className="min-w-0 flex-1"><span className="line-clamp-2 [overflow-wrap:anywhere]">{file.name}</span><span className="mt-0.5 block text-xs text-[var(--sub-text)]">{(file.size / 1024 / 1024).toFixed(2)}MB · {uploading ? "업로드 중" : "업로드 대기"}</span></span><button className="min-h-10 shrink-0 rounded-md px-2 text-sm font-bold text-[var(--alert)]" onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button">삭제</button></li>)}</ul> : null}</div>
            <input aria-hidden="true" className="hidden" onChange={(event) => updateField("website", event.target.value)} tabIndex={-1} value={formData.website} />
          </div>

          <div className="mt-5 min-w-0 rounded-lg bg-[var(--muted-surface)] p-4" id="privacy-details">
            <label className="flex min-w-0 items-start gap-3 text-sm leading-6 text-[var(--sub-text)]"><input aria-required="true" checked={formData.privacyAgreed} className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]" onChange={(event) => updateField("privacyAgreed", event.target.checked)} type="checkbox" /><span className="min-w-0">개인정보 수집 및 이용에 동의합니다. (필수)</span></label>
            <details className="mt-3 min-w-0 text-xs leading-6 text-[var(--sub-text)]"><summary className="cursor-pointer font-bold text-[var(--primary)]">수집·이용 내용 보기</summary><div className="mt-2 [overflow-wrap:anywhere]"><p><strong>수집 항목:</strong> 회사명, 담당자명, 연락처 및 사용자가 선택적으로 입력한 이메일·문의 내용·첨부파일·상세정보</p><p><strong>이용 목적:</strong> 문의 확인, 제품 상담, 견적 검토, 자료 제공, 회신 및 고객 응대</p><p><strong>보유기간:</strong> 문의 처리 목적 달성 후 지체 없이 파기하며, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p><p>동의를 거부할 수 있으나 문의 접수가 제한될 수 있습니다.</p></div></details>
            <a className="mt-2 inline-flex text-xs font-bold text-[var(--primary)] underline underline-offset-2" href="/privacy">개인정보처리방침</a>
          </div>

          {error ? <p aria-live="polite" className="mt-5 max-w-full [overflow-wrap:anywhere] rounded-lg border border-[var(--alert)] bg-[rgba(185,92,69,0.12)] p-4 text-sm font-bold text-[var(--alert)]">{error}</p> : null}
          {success ? <p aria-live="polite" className="mt-5 max-w-full [overflow-wrap:anywhere] rounded-md bg-[var(--sub-mint)] p-4 text-sm font-bold text-[var(--primary-dark)]">{success}</p> : null}
          <div className="mt-6 flex justify-center"><Button className="w-full sm:min-w-48 sm:w-auto" disabled={isLoading || !formData.inquiryType} type="submit">{uploading ? "첨부파일 업로드 중..." : isLoading ? "접수 중..." : submitLabel(formData.inquiryType)}</Button></div>
        </form>
      </div>
    </section>
  );
}
