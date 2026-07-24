import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import SectionTitle from "@/components/ui/SectionTitle";
import { sustainabilityData, sustainabilityPoints } from "@/lib/constants";

type EcoDataSectionProps = {
  statementThumbnailUrl?: string;
};

export default function EcoDataSection({
  statementThumbnailUrl,
}: EcoDataSectionProps) {
  return (
    <section
      id="environment"
      className="bg-[var(--primary-deep)] px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          dark
          eyebrow="Environmental Data"
          title="SGS 제3자 검증값을 기준으로 표시합니다"
          description="적용 모델과 검증 기준이 확인된 탄소발자국 값을 제공합니다."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-[0.42fr_1fr] md:items-stretch">
          <div className="relative mx-auto w-full max-w-[210px] self-center">
          <MediaPlaceholder
            alt="SGS 제품 탄소발자국 검증 성명서 표지"
            desktopRatio="210:297"
            expandable={false}
            fieldName="homePage.sustainability.statementThumbnail"
            guide="SGS 제품 탄소발자국 검증 성명서 A4 표지"
            label="검증 성명서 썸네일"
            mediaType="document"
            mobileRatio="210:297"
            src={statementThumbnailUrl}
          />
          </div>
          <div className="flex h-full flex-col gap-4">
            <article className="rounded-lg border border-white/12 bg-white/[0.04] p-6">
              <p className="en text-sm font-bold text-[var(--accent-gold)]">
                {sustainabilityData.model}
              </p>
              <p className="number mt-3 text-4xl font-bold text-white sm:text-5xl">
                {sustainabilityData.value}
                <span className="ml-2 text-base font-bold text-white/72 sm:text-lg">
                  {sustainabilityData.unit}
                </span>
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/8 px-3 py-1.5 text-white/78">
                  {sustainabilityData.standard}
                </span>
                <span className="rounded-full bg-white/8 px-3 py-1.5 text-white/78">
                  {sustainabilityData.verifier}
                </span>
                <span className="rounded-full bg-white/8 px-3 py-1.5 text-white/78">
                  성명서 {sustainabilityData.statementNumber}
                </span>
                <span className="rounded-full bg-white/8 px-3 py-1.5 text-white/78">
                  {sustainabilityData.issueDate}
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-white/68">
                {sustainabilityData.description}
              </p>
            </article>
            <div className="grid grid-cols-2 gap-3">
              {sustainabilityPoints.map((point) => (
                <div
                  className="rounded-lg border border-white/12 bg-white/[0.04] p-4 text-sm leading-6 font-bold text-white"
                  key={point}
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
