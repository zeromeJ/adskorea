"use client";

import { Boxes, Factory, PackageCheck, Weight } from "lucide-react";
import { scrollToSection } from "@/lib/scrollToSection";
import { trackEvent } from "@/lib/trackEvent";

const options = [
  {
    title: "수출 포장",
    description: "목적국과 운송조건을 함께 확인합니다.",
    icon: PackageCheck,
    detail: { inquiryType: "quote", usePurpose: "수출 운송", exportUse: "예" },
  },
  {
    title: "고중량 화물",
    description: "화물 중량과 하중 분포를 먼저 확인합니다.",
    icon: Weight,
    detail: { inquiryType: "consulting", usePurpose: "보관 또는 운송" },
  },
  {
    title: "자동화 설비",
    description: "컨베이어·랙·포크 조건을 확인합니다.",
    icon: Factory,
    detail: { inquiryType: "consulting", usePurpose: "자동화 설비" },
  },
  {
    title: "맞춤 제작",
    description: "화물 형상과 설비 제약을 함께 검토합니다.",
    icon: Boxes,
    detail: { inquiryType: "consulting", usePurpose: "맞춤 제작" },
  },
];

export default function ApplicationGuide() {
  function select(
    title: string,
    detail: { inquiryType: string; usePurpose: string; exportUse?: string },
  ) {
    trackEvent("application_guide_select", { option: title });
    window.dispatchEvent(new CustomEvent("adson:inquiry-prefill", { detail }));
    scrollToSection("inquiry");
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            className="group min-h-40 border border-white/18 bg-white/[0.06] p-5 text-left text-white transition hover:border-[var(--accent-gold)] hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-gold)]"
            key={option.title}
            onClick={() => select(option.title, option.detail)}
            type="button"
          >
            <Icon
              aria-hidden="true"
              className="text-[var(--accent-gold)]"
              size={24}
            />
            <strong className="mt-6 block text-lg">{option.title}</strong>
            <span className="mt-2 block text-sm leading-6 text-white/68">
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
