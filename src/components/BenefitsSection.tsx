import BenefitCard from "@/components/ui/BenefitCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { benefits } from "@/lib/constants";

export default function BenefitsSection() {
  return (
    <section id="benefits" className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Key Benefits"
          title="수출 포장, 보관 효율, 비용 구조를 동시에 개선합니다."
          description="ADS 아델슨 몰드 팔레트는 B2B 물류 현장에서 필요한 성능과 운영 효율을 중심으로 설계됩니다."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}
