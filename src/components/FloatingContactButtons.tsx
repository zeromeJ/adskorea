"use client";

import { company } from "@/lib/constants";
import { scrollToSection } from "@/lib/scrollToSection";

export default function FloatingContactButtons() {
  return (
    <div className="fixed bottom-5 right-4 z-40 flex w-[142px] flex-col gap-2 sm:bottom-8 sm:right-8 sm:w-[156px]"> 
      <a
        aria-label="견적 문의 작성 섹션으로 이동"
        className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-center text-sm font-bold text-[var(--primary-deep)] shadow-[0_16px_40px_rgba(16,37,29,0.16)] transition hover:-translate-y-0.5 hover:border-[var(--sub-sage)] hover:bg-[var(--sub-mint)]"
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
        className="group inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-[var(--primary-deep)] px-4 py-3 text-center text-sm font-bold text-white shadow-[0_16px_40px_rgba(16,37,29,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--primary-dark)]"
        href={company.phoneHref}
      >
        {/* <span className="block text-[11px] font-semibold text-white/58">
          빠른 상담
        </span> */}
        <svg
          aria-hidden="true"
          className="h-5 w-5 shrink-0 fill-white stroke-white"
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
