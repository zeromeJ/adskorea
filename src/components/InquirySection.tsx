"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  currentPalletTypeOptions,
  company,
  industryOptions,
  productInterestOptions,
} from "@/lib/constants";
import {
  ContactFormData,
  initialContactFormData,
  isValidPhone,
  validateContactForm,
} from "@/lib/contactSchema";

const emailDomainOptions = [
  { label: "직접 입력", value: "" },
  { label: "gmail.com", value: "gmail.com" },
  { label: "naver.com", value: "naver.com" },
  { label: "kakao.com", value: "kakao.com" },
  { label: "daum.net", value: "daum.net" },
  { label: "hanmail.net", value: "hanmail.net" },
  { label: "hotmail.com", value: "hotmail.com" },
  { label: "outlook.com", value: "outlook.com" },
];

export default function InquirySection() {
  const [formData, setFormData] = useState<ContactFormData>(
    initialContactFormData,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [emailLocalPart, setEmailLocalPart] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [showEmailDomains, setShowEmailDomains] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  function updateField(
    field: keyof ContactFormData,
    value: string | boolean,
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
    setSuccess("");
    setError("");
  }

  function updateEmail(localPart: string, domain: string) {
    setEmailLocalPart(localPart);
    setEmailDomain(domain);
    updateField("email", localPart || domain ? `${localPart}@${domain}` : "");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const validationMessage = validateContactForm(formData);

    if (validationMessage) {
      setPhoneTouched(true);
      setError(validationMessage);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit inquiry.");
      }

      setSuccess(
        "문의가 접수되었습니다. 담당자가 확인 후 입력하신 연락처로 회신드리겠습니다.",
      );
      setFormData(initialContactFormData);
      setEmailLocalPart("");
      setEmailDomain("");
      setPhoneTouched(false);
    } catch {
      setError("문의 접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      id="contact"
      className="bg-[var(--primary-dark)] px-5 pt-14 pb-16 lg:px-8 lg:pb-20"
    >
      <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-10">
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          <SectionTitle
            dark
            eyebrow="Inquiry"
            title="견적 문의"
            description="회사명, 담당자명, 연락처를 남겨주시면 담당자가 확인 후 연락드립니다."
          />
        </div>

        <form
          className="order-2 rounded-lg bg-white p-5 shadow-none sm:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-x-3 gap-y-5 min-[340px]:grid-cols-2 sm:gap-x-5">
            <Input
              id="companyName"
              label="회사명 (필수)"
              onChange={(event) => updateField("companyName", event.target.value)}
              placeholder="회사명을 입력해 주세요"
              required
              value={formData.companyName}
            />
            <Input
              id="contactPerson"
              label="담당자명 (필수)"
              onChange={(event) =>
                updateField("contactPerson", event.target.value)
              }
              placeholder="담당자명을 입력해 주세요"
              required
              value={formData.contactPerson}
            />
            <div className="col-span-full md:col-span-1">
              <Input
                id="phone"
                label="연락처 (필수)"
                onChange={(event) => updateField("phone", event.target.value)}
                onBlur={() => setPhoneTouched(true)}
                placeholder="010-1234-5678"
                required
                aria-invalid={
                  phoneTouched && formData.phone.length > 0
                    ? !isValidPhone(formData.phone)
                    : undefined
                }
                inputMode="tel"
                maxLength={30}
                type="tel"
                value={formData.phone}
              />
              {phoneTouched &&
              formData.phone.length > 0 &&
              !isValidPhone(formData.phone) ? (
                <p className="mt-2 text-sm font-bold text-[var(--alert)]">
                  전화번호 형식을 확인해 주세요. 예: 010-1234-5678
                </p>
              ) : null}
            </div>
            <div className="col-span-full md:col-span-1">
              <span className="mb-2 block text-sm font-bold text-[var(--text)]">
                이메일 (선택)
              </span>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 sm:gap-2">
                <input
                  aria-label="이메일 아이디"
                  autoComplete="off"
                  className="min-h-12 w-full rounded-md border border-[var(--line)] bg-white px-2 text-xs outline-none transition placeholder:text-[#95a29a] focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)] sm:px-3 sm:text-sm"
                  onChange={(event) =>
                    updateEmail(event.target.value, emailDomain)
                  }
                  type="text"
                  value={emailLocalPart}
                />
                <span className="font-bold text-[var(--sub-text)]">@</span>
                <div className="relative">
                  <input
                    aria-autocomplete="list"
                    aria-controls="email-domain-options"
                    aria-expanded={showEmailDomains}
                    aria-label="이메일 도메인"
                    className="min-h-12 w-full rounded-md border border-[var(--line)] bg-white px-2 text-xs outline-none transition placeholder:text-[#95a29a] focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)] sm:px-3 sm:text-sm"
                    onBlur={() => setShowEmailDomains(false)}
                    onChange={(event) =>
                      updateEmail(emailLocalPart, event.target.value)
                    }
                    onFocus={() => setShowEmailDomains(true)}
                    placeholder="직접 입력"
                    role="combobox"
                    type="text"
                    value={emailDomain}
                  />
                  {showEmailDomains ? (
                    <div
                      className="absolute top-full right-0 z-30 mt-2 w-32 overflow-hidden rounded-md border border-[var(--line)] bg-white py-1 shadow-lg sm:left-0 sm:w-auto"
                      id="email-domain-options"
                      role="listbox"
                    >
                      {emailDomainOptions.map((option) => (
                        <button
                          aria-selected={emailDomain === option.value}
                          className="block min-h-10 w-full px-3 text-left text-sm text-[var(--text)] hover:bg-[var(--sub-mint)] focus:bg-[var(--sub-mint)] focus:outline-none"
                          key={option.label}
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={() => {
                            updateEmail(emailLocalPart, option.value);
                            setShowEmailDomains(false);
                          }}
                          role="option"
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <fieldset className="col-span-full">
              <legend className="mb-2 block text-sm font-bold text-[var(--text)]">
                회신 방법 (필수)
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "PHONE", label: "전화" },
                  { value: "TEXT", label: "문자" },
                  { value: "BOTH", label: "둘 다 괜찮음" },
                ].map((option) => {
                  const selected = formData.responseMethod === option.value;

                  return (
                    <button
                      aria-pressed={selected}
                      className={`min-h-11 rounded-lg border px-3 text-sm font-bold transition sm:min-h-12 ${
                        selected
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--line)] bg-white text-[var(--text)] hover:border-[var(--primary)]"
                      }`}
                      key={option.value}
                      onClick={() =>
                        updateField(
                          "responseMethod",
                          option.value as ContactFormData["responseMethod"],
                        )
                      }
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <Select
              containerClassName="col-span-full"
              id="industry"
              label="산업 분야 (선택)"
              onChange={(event) => updateField("industry", event.target.value)}
              options={industryOptions}
              value={formData.industry}
            />
            <Select
              id="currentPalletType"
              label="사용 팔레트 (선택)"
              onChange={(event) =>
                updateField("currentPalletType", event.target.value)
              }
              options={currentPalletTypeOptions}
              value={formData.currentPalletType}
            />
            <Select
              id="productInterest"
              label="관심 제품 (선택)"
              onChange={(event) =>
                updateField("productInterest", event.target.value)
              }
              options={productInterestOptions}
              value={formData.productInterest}
            />
            <label className="col-span-full" htmlFor="message">
              <span className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-[var(--text)]">
                <span>문의 내용 (선택)</span>
                <span className="font-medium text-[var(--sub-text)]">
                  {formData.message.length}/300자
                </span>
              </span>
              <textarea
                className="min-h-32 w-full resize-y rounded-md border border-[var(--line)] bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#95a29a] focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)]"
                id="message"
                maxLength={300}
                onChange={(event) => updateField("message", event.target.value)}
                placeholder="제품 규격, 사용 환경, 요청 사항 등을 입력해 주세요"
                value={formData.message}
              />
            </label>
            <input
              aria-hidden="true"
              autoComplete="off"
              className="hidden"
              id="website"
              name="website"
              onChange={(event) => updateField("website", event.target.value)}
              tabIndex={-1}
              type="text"
              value={formData.website}
            />
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-[var(--sub-text)]">
            <input
              checked={formData.privacyAgreed}
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
              onChange={(event) =>
                updateField("privacyAgreed", event.target.checked)
              }
              type="checkbox"
            />
            <span>
              개인정보 수집 및 이용에 동의합니다.
            </span>
          </label>

          {error ? (
            <p className="mt-5 rounded-lg border border-[var(--alert)] bg-[rgba(185,92,69,0.12)] p-4 text-sm font-bold text-[var(--alert)] shadow-none">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="mt-5 rounded-md bg-[var(--sub-mint)] p-4 text-sm font-bold text-[var(--primary-dark)]">
              {success}
            </p>
          ) : null}

          <Button className="mt-6 w-full" disabled={isLoading} type="submit">
            {isLoading ? "제출 중..." : "견적 문의 제출"}
          </Button>
        </form>

        <aside className="order-3 lg:sticky lg:top-28 lg:col-start-1 lg:row-start-2">
          <div className="rounded-lg border border-white/12 bg-white/[0.04] p-5 text-white">
            <p className="text-sm font-bold text-[var(--accent-gold)]">
              빠른 견적 상담
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-white/78">
              {[
                "무료 상담",
                "맞춤 규격 검토",
                "빠른 견적 회신",
                "전화 또는 문자 상담 가능",
              ].map((item) => (
                <li className="flex items-center gap-3" key={item}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gold)] text-[11px] font-black text-[var(--primary-deep)]">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <LinkButton
            className="mt-3 w-full gap-2"
            href={company.phoneHref}
            variant="light"
          >
            <svg
              aria-hidden="true"
              className="h-[18px] w-[18px] fill-none stroke-current"
              viewBox="0 0 24 24"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.6"
              />
            </svg>
            전화하기
          </LinkButton>
        </aside>
      </div>
    </section>
  );
}
