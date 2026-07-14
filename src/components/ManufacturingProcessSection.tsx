import SectionTitle from "@/components/ui/SectionTitle";
import { processSteps } from "@/lib/constants";

export default function ManufacturingProcessSection() {
  return (
    <section id="manufacturing-process" className="bg-[var(--muted-surface)] px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Manufacturing Process"
          title="원료 선별부터 검사·출하까지"
          description="목질 원료의 함수율을 조정하고 MDI계 접착 시스템과 고온·고압 압축성형 공정을 적용합니다."
        />
        <ol className="mt-8 grid min-w-0 grid-cols-1 gap-3 min-[341px]:grid-cols-2 lg:grid-cols-7">
          {processSteps.map((step, index) => (
            <li
              className="flex w-full min-w-0 max-w-full items-center gap-3 rounded-lg border border-[var(--line)] bg-white p-4 lg:flex-col lg:items-start lg:gap-2"
              key={step}
            >
              <span className="number shrink-0 text-xs font-bold text-[var(--accent-gold-dark)]">
                0{index + 1}
              </span>
              <p className="min-w-0 text-sm leading-6 font-bold text-[var(--text)]">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
