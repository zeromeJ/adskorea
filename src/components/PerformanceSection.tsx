import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import SectionTitle from "@/components/ui/SectionTitle";
import VerificationPanel from "@/components/VerificationPanel";
import type { TestGroup } from "@/components/VerificationPanel";
import { performanceFeatureGroups, testGroups } from "@/lib/constants";

type PerformanceSectionProps = {
  testImageUrl?: string;
  reportThumbnailUrl?: string;
  reportFileUrl?: string;
  groups?: TestGroup[];
};

export default function PerformanceSection({
  testImageUrl,
  reportThumbnailUrl,
  reportFileUrl,
  groups = testGroups,
}: PerformanceSectionProps) {
  return (
    <section
      id="performance"
      className="bg-white px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Performance Verification"
          title="시험 데이터로 확인하는 제품 성능"
          description="제조사 제시 사양과 제3자 시험결과를 구분해 제공합니다."
        />

        <div className="mx-auto mt-8 grid max-w-[920px] gap-4 min-[520px]:grid-cols-[minmax(0,256fr)_minmax(0,81fr)] min-[520px]:items-start">
          <MediaPlaceholder
            alt="압축성형 목재 팔레트 성능 시험 현장"
            desktopRatio="16:9"
            fieldName="homePage.verification.testImage"
            guide="시험 장비, 적용 시료와 하중 조건이 함께 보이는 실제 시험 사진"
            label="성능 시험 사진"
            mobileRatio="16:9"
            src={testImageUrl}
          />
          <div className="relative">
            <MediaPlaceholder
              alt="제품 성능 시험성적서 표지"
              desktopRatio="9:16"
              fieldName="homePage.verification.reportThumbnail"
              guide="공개 가능한 시험성적서 A4 표지 또는 핵심 페이지"
              label="시험성적서 썸네일"
              mediaType="document"
              mobileRatio="9:16"
              src={reportThumbnailUrl}
            />
            {reportFileUrl ? <a aria-label="시험성적서 PDF 열기" className="absolute right-2 bottom-2 z-20 rounded-md bg-[var(--primary)] px-3 py-2 text-xs font-bold text-white" href={reportFileUrl} rel="noreferrer" target="_blank">PDF 열기</a> : null}
          </div>
        </div>

        <VerificationPanel groups={groups} />

        <div className="mt-6 grid items-stretch gap-3 lg:grid-cols-3">
          {performanceFeatureGroups.map((group, index) => <article className="h-full rounded-lg border border-[var(--line)] bg-[var(--muted-surface)] p-4" key={group.title}><h3 className="font-bold text-[var(--primary-dark)]">{group.title}</h3><ul className={`mt-2 grid gap-x-3 gap-y-1 text-sm leading-5 text-[var(--sub-text)] ${index === 0 ? "grid-cols-1" : "grid-cols-2"}`}>{group.items.map((item) => <li className="min-w-0 [overflow-wrap:anywhere]" key={item}>• {item}</li>)}</ul></article>)}
        </div>

        <div className="mt-5 rounded-lg border border-[var(--line)] bg-white p-5">
          <p className="font-bold text-[var(--text)]">포름알데히드 방출량 시험</p>
          <p className="number mt-2 text-2xl font-bold text-[var(--primary)]">0.9mg/L</p>
          <p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">
            방법 검출한계 0.1mg/L · 시험방법 GB/T 17657-2022 · 보고서 TBK20260318Lab10101-1A · 2026년 4월 2일 발급
          </p>
        </div>
      </div>
    </section>
  );
}
