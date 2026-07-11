"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  currentPalletTypeOptions,
  industryOptions,
  productInterestOptions,
} from "@/lib/constants";
import {
  ContactFormData,
  initialContactFormData,
  validateContactForm,
} from "@/lib/contactSchema";

export default function InquirySection() {
  const [formData, setFormData] = useState<ContactFormData>(
    initialContactFormData,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateField(
    field: keyof ContactFormData,
    value: string | boolean,
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
    setSuccess("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const validationMessage = validateContactForm(formData);

    if (validationMessage) {
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
    } catch {
      setError("문의 접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      id="contact"
      className="bg-[var(--primary-dark)] px-5 py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <SectionTitle
            dark
            eyebrow="도입 상담"
            title="도입 상담 및 견적 문의"
            description="회사명, 담당자명, 연락처를 남겨주시면 담당자가 확인 후 연락드립니다."
          />
          <div className="mt-8 rounded-lg border border-white/12 bg-white/[0.04] p-5 text-white">
            <p className="text-sm font-bold text-[var(--accent-gold)]">
              상담 진행 방식
            </p>
            <ol className="mt-4 grid gap-3 text-sm leading-6 text-white/72">
              <li>1. 문의 내용 접수</li>
              <li>2. 제품 사양 및 수출 조건 검토</li>
              <li>3. 담당자 견적 및 상담 회신</li>
            </ol>
          </div>
        </div>

        <form
          className="rounded-lg bg-white p-5 shadow-2xl shadow-black/20 sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 md:grid-cols-2">
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
            <Input
              id="email"
              label="이메일 (선택)"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="이메일을 입력해 주세요"
              type="email"
              value={formData.email}
            />
            <Input
              id="phone"
              label="연락처 (필수)"
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="연락처를 입력해 주세요"
              required
              value={formData.phone}
            />
            <Select
              id="industry"
              label="산업 분야 (선택)"
              onChange={(event) => updateField("industry", event.target.value)}
              options={industryOptions}
              value={formData.industry}
            />
            <Select
              id="currentPalletType"
              label="현재 사용 중인 팔레트 (선택)"
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
            <p className="mt-5 rounded-md bg-[rgba(185,92,69,0.12)] p-4 text-sm font-bold text-[var(--alert)]">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="mt-5 rounded-md bg-[var(--sub-mint)] p-4 text-sm font-bold text-[var(--primary-dark)]">
              {success}
            </p>
          ) : null}

          <Button className="mt-6 w-full" disabled={isLoading} type="submit">
            {isLoading ? "제출 중..." : "문의 제출하기"}
          </Button>
        </form>
      </div>
    </section>
  );
}
