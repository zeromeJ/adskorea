import IndustryCard from "@/components/ui/IndustryCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { industries } from "@/lib/constants";

export default function IndustriesSection() {
  return (
    <section id="industries" className="bg-[var(--muted-surface)] px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Industries"
          title="수출 제조부터 물류센터까지 폭넓게 대응합니다."
          description="제품 손상 리스크, 보관 공간, 수출 규정, 반복 운영 비용을 함께 검토해야 하는 산업에 적합합니다."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <IndustryCard key={industry} title={industry} />
          ))}
        </div>
      </div>
    </section>
  );
}
