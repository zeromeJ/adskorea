"use client";

import { scrollToSection } from "@/lib/scrollToSection";

export default function FloatingContactButtons() {
  return (
    <div className="fixed right-3 bottom-4 z-40 flex w-[144px] flex-col sm:right-8 sm:bottom-8 sm:w-[144px]">
      <a
        aria-label="견적 및 문의 작성 섹션으로 이동"
        className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-3 text-center text-base font-extrabold text-white shadow-[0_8px_20px_rgba(16,37,29,0.14)] transition hover:-translate-y-0.5 hover:bg-[var(--primary-dark)]"
        href="#inquiry"
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
