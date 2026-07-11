import { company } from "@/lib/constants";

export default function FloatingContactButtons() {
  return (
    <div className="fixed bottom-5 right-4 z-40 flex w-[142px] flex-col gap-2 sm:bottom-8 sm:right-8 sm:w-[156px]">
      <a
        aria-label="전화 상담 바로 연결"
        className="group rounded-lg border border-white/20 bg-[var(--primary-deep)] px-4 py-3 text-center text-sm font-bold text-white shadow-[0_16px_40px_rgba(16,37,29,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--primary-dark)]"
        href={company.phoneHref}
      >
        <span className="block text-[11px] font-semibold text-white/58">
          빠른 상담
        </span>
        전화 상담
      </a>
      <a
        aria-label="견적 문의 작성 섹션으로 이동"
        className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-center text-sm font-bold text-[var(--primary-deep)] shadow-[0_16px_40px_rgba(16,37,29,0.16)] transition hover:-translate-y-0.5 hover:border-[var(--sub-sage)] hover:bg-[var(--sub-mint)]"
        href="#contact"
      >
        <span className="block text-[11px] font-semibold text-[var(--sub-text)]">
          도입 상담
        </span>
        견적 문의
      </a>
    </div>
  );
}
