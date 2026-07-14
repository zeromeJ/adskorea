import PalletVisual from "@/components/ui/PalletVisual";
import SectionTitle from "@/components/ui/SectionTitle";
import SpecCard from "@/components/ui/SpecCard";
import { performanceFeatures } from "@/lib/constants";

const performanceSummary = [
  {
    label: "최대 동하중",
    value: "2,800",
    unit: "kg",
    description: "제품군 최대 운용 하중",
  },
  {
    label: "최대 정하중",
    value: "10,000",
    unit: "kg",
    description: "제품군 최대 보관 하중",
  },
  {
    label: "자동화 대응",
    value: "물류 라인",
    description: "자동화 물류 라인 적용 가능",
  },
];

export default function PerformanceSection() {
  return (
    <section id="performance" className="bg-white px-5 pt-14 pb-16 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <PalletVisual />
          </div>
          <div>
            <SectionTitle
              eyebrow="Performance Specs"
              title="친환경을 넘어, 산업 물류에 필요한 강도까지"
              description="일체형 정밀 성형 구조를 통해 안정적인 구조 강도를 구현하고, 방수성, 내후성, 하중 지지 성능을 강화했습니다."
            />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              {performanceFeatures.map((feature) => (
                <SpecCard key={feature} label="Feature" value={feature} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-12">
          {performanceSummary.map((item) => (
            <article
              className="rounded-lg border border-[var(--line)] bg-[var(--muted-surface)] px-5 py-5 sm:px-4 lg:px-6 lg:py-6"
              key={item.label}
            >
              <p className="text-sm font-bold text-[var(--primary-dark)]">
                {item.label}
              </p>
              <p
                className={`${item.unit ? "number " : ""}mt-2 whitespace-nowrap text-[clamp(1.65rem,3vw,2.25rem)] leading-none font-bold tracking-[-0.03em] text-[var(--primary)]`}
              >
                {item.value}
                {item.unit ? (
                  <span className="ml-1 text-base font-bold tracking-normal sm:text-sm lg:text-lg">
                    {item.unit}
                  </span>
                ) : null}
              </p>
              <p className="mt-2 text-sm leading-5 text-[var(--sub-text)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--sub-text)]">
          실제 성능은 제품 모델, 사용 환경, 시험 조건에 따라 달라질 수 있습니다.
        </p>
      </div>
    </section>
  );
}
