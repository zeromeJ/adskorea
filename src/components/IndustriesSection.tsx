import IndustryCard from "@/components/ui/IndustryCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { industries } from "@/lib/constants";

type IndustryItem = (typeof industries)[number];

export default function IndustriesSection({
  items = industries,
}: {
  items?: IndustryItem[];
}) {
  return (
    <section
      id="applications"
      className="bg-[var(--muted-surface)] px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Applications"
          title="화물과 운용환경을 기준으로 검토하는 적용 분야"
          description="산업명만으로 적용 가능 여부를 단정하지 않으며 화물 형상, 팔레트당 중량, 적재·운송 방식과 사용설비를 함께 확인합니다."
        />
        <div className="mt-8 grid min-w-0 grid-cols-1 gap-4 min-[341px]:grid-cols-2 lg:grid-cols-3">
          {items.map((industry) => (
            <IndustryCard key={industry.title} {...industry} />
          ))}
        </div>
      </div>
    </section>
  );
}
