import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import SectionTitle from "@/components/ui/SectionTitle";
import StatCard from "@/components/ui/StatCard";
import { companyStats } from "@/lib/constants";

type AboutSectionProps = {
  factoryImageUrl?: string;
};

export default function AboutSection({ factoryImageUrl }: AboutSectionProps) {
  return (
    <section id="company" className="px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="order-2 min-w-0 lg:order-1">
            <MediaPlaceholder
              alt="ADS 아델슨 생산시설 전경"
              desktopRatio="16:9"
              fieldName="companyGallery.featured.image"
              guide="위치와 촬영일을 확인할 수 있는 실제 공장 전경"
              label="회사·공장 대표 이미지"
              src={factoryImageUrl}
            />
            <p className="mt-3 text-xs leading-5 text-[var(--sub-text)]">투자액, 부지면적, 설계 생산능력과 특허·관련 증서 수는 회사 제공 자료 기준입니다.</p>
          </div>
          <div className="order-1 lg:order-2">
            <SectionTitle
              eyebrow="Company / Manufacturing"
              title="생산·기술 기반과 운영 역량"
              description="아래 생산 및 운영 지표는 회사 제공 자료를 기준으로 합니다."
            />
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {companyStats.map((stat, index) => (
                <StatCard
                  className={`h-full ${index < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}
                  company
                  key={stat.label}
                  {...stat}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
