import PalletVisual from "@/components/ui/PalletVisual";
import SectionTitle from "@/components/ui/SectionTitle";
import SpecCard from "@/components/ui/SpecCard";
import { modelSpecs, performanceFeatures } from "@/lib/constants";

export default function PerformanceSection() {
  return (
    <section id="performance" className="bg-white px-5 pt-10 pb-16 lg:px-8 lg:pt-14 lg:pb-20">
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
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {performanceFeatures.map((feature) => (
                <SpecCard key={feature} label="Feature" value={feature} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead className="en bg-[var(--muted-surface)] text-xs uppercase tracking-[0.08em] text-[var(--sub-text)]">
              <tr>
                <th className="p-4">모델군</th>
                <th className="p-4">대표 규격</th>
                <th className="p-4">동하중</th>
                <th className="p-4">정하중</th>
                <th className="p-4">추천 용도</th>
              </tr>
            </thead>
            <tbody>
              {modelSpecs.map((spec) => (
                <tr className="border-t border-[var(--line)]" key={spec.model}>
                  <td className="p-4 font-bold text-[var(--primary-dark)]">{spec.model}</td>
                  <td className="p-4 text-[var(--sub-text)]">{spec.size}</td>
                  <td className="number p-4 font-bold">{spec.dynamicLoad}</td>
                  <td className="number p-4 font-bold">{spec.staticLoad}</td>
                  <td className="p-4 text-[var(--sub-text)]">{spec.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
