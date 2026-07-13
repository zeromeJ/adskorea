"use client";

import { scrollToSection } from "@/lib/scrollToSection";

export default function FloatingContactButtons() {
  return (
    <div className="fixed bottom-4 right-3 z-40 flex w-[118px] flex-col gap-1.5 sm:bottom-8 sm:right-8 sm:w-[156px] sm:gap-2">
      <a
        aria-label="견적 문의 작성 섹션으로 이동"
        className="group inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-[var(--primary-deep)] px-3 py-2.5 text-center text-xs font-bold text-white shadow-[0_10px_24px_rgba(16,37,29,0.14)] transition hover:-translate-y-0.5 hover:bg-[var(--primary-dark)] sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
        href="#contact"
        onClick={(event) => {
          event.preventDefault();
          scrollToSection("contact");
        }}
      >
        견적 문의하기
      </a>
    </div>
  );
}
