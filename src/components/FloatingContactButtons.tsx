"use client";

import { company } from "@/lib/constants";
import { scrollToSection } from "@/lib/scrollToSection";

export default function FloatingContactButtons() {
  return (
    <div className="fixed bottom-4 right-3 z-40 flex w-[118px] flex-col gap-1.5 sm:bottom-8 sm:right-8 sm:w-[156px] sm:gap-2">
      <a
        aria-label="견적 문의 작성 섹션으로 이동"
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-center text-xs font-bold text-[var(--primary-deep)] shadow-[0_10px_24px_rgba(16,37,29,0.1)] transition hover:-translate-y-0.5 hover:border-[var(--sub-sage)] hover:bg-[var(--sub-mint)] sm:px-4 sm:py-3 sm:text-sm"
        href="#contact"
        onClick={(event) => {
          event.preventDefault();
          scrollToSection("contact");
        }}
      >
        견적 문의하기
      </a>
      <a
        aria-label="전화 상담 바로 연결"
        className="group inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-[var(--primary-deep)] px-3 py-2.5 text-center text-xs font-bold text-white shadow-[0_10px_24px_rgba(16,37,29,0.14)] transition hover:-translate-y-0.5 hover:bg-[var(--primary-dark)] sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
        href={company.phoneHref}
      >
        {/* <span className="block text-[11px] font-semibold text-white/58">
          빠른 상담
        </span> */}
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0 fill-white stroke-white sm:h-5 sm:w-5"
          viewBox="0 0 24 24"
        >
          <path
            d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"
            strokeLinejoin="round"
            strokeWidth="1.2"
          />
        </svg>
        <span>전화 상담</span>
      </a>
    </div>
  );
}
