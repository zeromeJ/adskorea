import PalletVisual from "@/components/ui/PalletVisual";
import SectionTitle from "@/components/ui/SectionTitle";
import SpecCard from "@/components/ui/SpecCard";
import { performanceSpecs } from "@/lib/constants";

export default function PerformanceSection() {
  return (
    <section id="performance" className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <PalletVisual />
          <p className="mt-4 rounded-md border border-[var(--line)] bg-white p-4 text-sm leading-6 text-[var(--sub-text)]">
            Actual performance may vary depending on product type and test
            conditions.
          </p>
        </div>
        <div>
          <SectionTitle
            eyebrow="Performance Specs"
            title="하중, 적층, 저온 조건까지 검토한 기술 사양"
            description="정밀 몰드 생산 기술을 기반으로 반복되는 수출 포장 환경에 맞는 균일한 성능을 제공합니다."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {performanceSpecs.map((spec) => (
              <SpecCard key={spec.label} {...spec} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
