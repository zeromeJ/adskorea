import SectionTitle from "@/components/ui/SectionTitle";
import { problemCards } from "@/lib/constants";

export default function ProblemSection() {
  return (
    <section id="problem" className="bg-white px-5 pt-10 pb-16 lg:px-8 lg:pt-14 lg:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Operational Risk"
          title="기존 팔레트, 단가만 보고 선택해도 괜찮을까요?"
          description="팔레트는 단순한 받침대가 아닙니다. 수출 절차, 보관 공간, 운송 효율, 제품 파손까지 물류 운영 전반에 영향을 미치는 핵심 포장 자재입니다."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {problemCards.map((card, index) => (
            <article
              className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-6"
              key={card.title}
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-[var(--sub-sage)]">
                <span className="number text-sm font-bold text-[var(--primary)]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text)]">
                {card.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--sub-text)]">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
