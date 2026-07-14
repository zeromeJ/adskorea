import SectionTitle from "@/components/ui/SectionTitle";

const reviewItems = ["목적국 수출 규정", "화물 형상과 중량", "하중 분포", "적재 방식", "랙 구조", "지게차 진입 방향", "자동화 설비", "보관환경", "예상 사용수량"];

export default function ExportReadinessSection() {
  return (
    <section id="pre-application" className="bg-[var(--primary-deep)] px-5 pt-12 pb-14 text-white lg:px-8 lg:pb-[72px]">
      <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
        <SectionTitle dark eyebrow="Pre-Application Review" title="적용 전 확인사항" description="제품 선택 전 수출 규정, 화물과 사용설비 조건을 함께 확인합니다." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{reviewItems.map((item, index) => <article className="flex min-h-16 items-center gap-3 rounded-lg border border-white/12 bg-white/[0.04] px-4 py-3" key={item}><span className="number shrink-0 text-xs font-bold text-[var(--accent-gold)]">{String(index + 1).padStart(2, "0")}</span><h3 className="min-w-0 text-sm font-bold text-white">{item}</h3></article>)}</div>
      </div>
    </section>
  );
}
