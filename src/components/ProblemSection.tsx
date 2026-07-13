import SectionTitle from "@/components/ui/SectionTitle";
import { problemCards } from "@/lib/constants";

export default function ProblemSection() {
  return (
    <section id="problem" className="bg-white px-5 pt-14 pb-16 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Operational Risk"
          title="기존 팔레트, 단가만 보고 선택해도 괜찮을까요?"
          description="팔레트는 단순한 받침대가 아닙니다. 수출 절차, 보관 공간, 운송 효율, 제품 파손까지 물류 운영 전반에 영향을 미치는 핵심 포장 자재입니다."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {problemCards.map((card, index) => (
            <article
              className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-6 transition duration-300 hover:border-[var(--primary)] hover:shadow-[0_8px_20px_rgba(16,37,29,0.06)]"
              key={card.title}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--sub-sage)] bg-[var(--primary)]">
                  <span className="number text-[11px] font-extrabold text-white">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[var(--text)]">
                  {card.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--sub-text)]">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
