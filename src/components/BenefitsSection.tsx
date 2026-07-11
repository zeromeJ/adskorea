import BenefitCard from "@/components/ui/BenefitCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { benefits } from "@/lib/constants";

export default function BenefitsSection() {
  return (
    <section id="benefits" className="px-5 pt-10 pb-16 lg:px-8 lg:pt-14 lg:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Key Benefits"
          title="수출, 보관, 비용까지 바꾸는 팔레트 솔루션"
          description="기존 팔레트의 운영 부담을 줄이고, 글로벌 물류 환경에 맞춘 효율적인 포장 솔루션을 제공합니다."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}
