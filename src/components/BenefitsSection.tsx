import BenefitCard from "@/components/ui/BenefitCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { benefits } from "@/lib/constants";

export default function BenefitsSection() {
  return (
    <section id="benefits" className="bg-[var(--muted-surface)] px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Key Benefits"
          title="운영조건에 따라 검토할 수 있는 핵심 장점"
          description="수출 규정, 중첩 적재 가능 여부와 물류 총비용을 제품 모델과 실제 운용조건에 맞춰 검토합니다."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={benefit.title}
              variant={index === 0 ? "dark" : index === 2 ? "accent" : "default"}
              {...benefit}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
