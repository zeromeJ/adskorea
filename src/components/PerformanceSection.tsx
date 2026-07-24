import SectionTitle from "@/components/ui/SectionTitle";
import VerificationPanel from "@/components/VerificationPanel";
import type { TestGroup } from "@/components/VerificationPanel";
import { performanceFeatureGroups, testGroups } from "@/lib/constants";

type PerformanceSectionProps = {
  groups?: TestGroup[];
};

export default function PerformanceSection({
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
