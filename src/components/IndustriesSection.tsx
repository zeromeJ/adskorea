import IndustryCard from "@/components/ui/IndustryCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { caseReferences, industries } from "@/lib/constants";

export default function IndustriesSection() {
  return (
    <section id="industries" className="bg-[var(--muted-surface)] px-5 pt-14 pb-16 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Industries"
          title="수출 제조부터 자동화 물류까지, 다양한 산업에 적용됩니다"
          description="제품별 특성에 맞춘 구조 설계로 운송 안정성과 적재 효율을 동시에 높입니다."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <IndustryCard key={industry.title} {...industry} />
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
          <p className="en text-sm font-bold text-[var(--accent-gold)]">
            제품 적용 사례
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {caseReferences.map((item) => (
              <span
                className="en rounded-md bg-[var(--muted-surface)] px-3 py-2 text-xs font-bold text-[var(--primary)]"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
