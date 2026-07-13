import PalletVisual from "@/components/ui/PalletVisual";
import SectionTitle from "@/components/ui/SectionTitle";
import SpecCard from "@/components/ui/SpecCard";
import ModelSpecTable from "@/components/ui/ModelSpecTable";
import { modelSpecs, performanceFeatures } from "@/lib/constants";

export default function PerformanceSection() {
  return (
    <section id="performance" className="bg-white px-5 pt-14 pb-16 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <PalletVisual />
            <p className="mt-4 rounded-md text-sm leading-6 text-[var(--sub-text)]">
              실제 성능은 제품 모델, 사용 환경, 시험 조건에 따라 달라질 수 있습니다.
            </p>
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

        <ModelSpecTable specs={modelSpecs} />
      </div>
    </section>
  );
}
