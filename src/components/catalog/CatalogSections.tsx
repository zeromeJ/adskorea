import Image from "next/image";
import {
  ArrowRight,
  Check,
  Factory,
  PackageSearch,
} from "lucide-react";
import SourceBadge from "@/components/SourceBadge";
import {
  CatalogApplicationExplorer,
  CatalogDocumentLibrary,
  ModelSpecificationsExplorer,
  RndQualityTabs,
} from "@/components/catalog/CatalogInteractive";
import {
  allModelSpecifications,
  applicationCheckGroups,
  carbonFootprint,
  catalogDocuments,
  companyCapabilities,
  formaldehydeTest,
  generalComparison,
  manufacturingProcess,
  manufacturerComparison,
  marketItems,
  operationalAdvantages,
  physicalTests,
  productFamilies,
  productOverviewCards,
  productStructureItems,
} from "@/data/catalog/content";
import { siteConfig } from "@/data/catalog/siteConfig";
import type {
  CatalogApplicationCase,
  CatalogDocument,
  TestResult,
} from "@/data/catalog/types";

export function CatalogSectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-4xl catalog-section-line pt-6" data-catalog-reveal>
      <p className={`en text-xs font-bold uppercase tracking-[0.22em] ${dark ? "text-[var(--catalog-gold)]" : "text-[var(--catalog-green)]"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-5 text-[clamp(2.35rem,5vw,4.7rem)] font-extrabold leading-[1.08] tracking-[-0.045em] ${dark ? "text-[var(--catalog-cream)]" : "text-[var(--catalog-green-dark)]"}`}>
        {title}
      </h2>
      {description ? <p className={`mt-6 max-w-3xl text-base leading-[1.85] sm:text-lg ${dark ? "text-white/68" : "text-[var(--catalog-muted)]"}`}>{description}</p> : null}
    </div>
  );
}

export function ChapterHeader({
  number,
  label,
  title,
  dark = false,
}: {
  number: string;
  label: string;
  title: string;
  dark?: boolean;
}) {
  return (
    <div className="relative mb-14 overflow-hidden border-b border-current/15 pb-8 lg:mb-20" data-catalog-reveal>
      <span aria-hidden="true" className={`number pointer-events-none absolute -right-2 -bottom-14 text-[clamp(7rem,14vw,13.75rem)] font-bold leading-none ${dark ? "text-white/[0.04]" : "text-[var(--catalog-green)]/[0.05]"}`}>{number}</span>
      <div className="relative flex items-end gap-5">
        <div>
          <p className={`en text-xs font-bold tracking-[0.24em] ${dark ? "text-[var(--catalog-gold)]" : "text-[var(--catalog-green)]"}`}>PART {number}</p>
          <p className={`en mt-2 text-sm font-bold tracking-[0.14em] ${dark ? "text-white/50" : "text-[var(--catalog-muted)]"}`}>{label}</p>
        </div>
        <span aria-hidden="true" className="mb-1 h-px w-16 bg-[var(--catalog-gold)]" />
        <p className={`text-lg font-extrabold ${dark ? "text-[var(--catalog-cream)]" : "text-[var(--catalog-green-dark)]"}`}>{title}</p>
      </div>
    </div>
  );
}

export function CatalogHero({ imageUrl }: { imageUrl?: string }) {
  return (
    <section className="catalog-hero-glow relative min-h-[90svh] overflow-hidden bg-[var(--catalog-cream)] px-5 py-12 lg:flex lg:items-center lg:px-8 lg:py-20" id="hero">
      <span aria-hidden="true" className="number pointer-events-none absolute top-[8%] right-[-2%] text-[clamp(9rem,20vw,22rem)] font-bold leading-none text-[var(--catalog-green)]/[0.04]">2026</span>
      <p aria-hidden="true" className="en absolute top-1/2 right-5 hidden -translate-y-1/2 [writing-mode:vertical-rl] text-xs font-bold tracking-[0.3em] text-[var(--catalog-green)]/38 xl:block">COMPRESSED WOOD PALLET</p>
      <div className="relative mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-center lg:gap-4">
        <div className="relative z-10 max-w-xl" data-catalog-reveal>
          <div className="flex items-center gap-4"><span className="en text-xs font-bold uppercase tracking-[0.24em] text-[var(--catalog-green)]">Digital Product Catalog</span><span className="en border-l border-[var(--catalog-gold)] pl-4 text-xs font-bold text-[var(--catalog-muted)]">2026</span></div>
          <div className="mt-8 h-0.5 w-16 bg-[var(--catalog-gold)]" />
          <h1 className="mt-7 text-[clamp(3.2rem,6.8vw,6.5rem)] font-extrabold leading-[0.98] tracking-[-0.06em] text-[var(--catalog-green-dark)]">압축성형<br />목재 팔레트</h1>
          <p className="mt-8 max-w-lg text-lg leading-[1.8] text-[var(--catalog-muted)] sm:text-xl">제품 구조부터 성능시험, 모델 사양과 실제 적용 검토까지.<br className="hidden sm:block" />구매 판단에 필요한 내용을 웹에서 한 번에 확인하세요.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-[var(--catalog-green)] px-6 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[var(--catalog-green-dark)]" href="#catalog-guide">카탈로그 시작하기<ArrowRight aria-hidden="true" size={18} /></a>
            <a className="inline-flex min-h-[52px] items-center justify-center border border-[var(--catalog-green)] px-6 font-extrabold text-[var(--catalog-green-dark)] transition hover:-translate-y-0.5 hover:bg-[var(--catalog-soft-green)]" href="#contact">제품 적용 문의</a>
          </div>
          <p className="mt-7 max-w-lg border-l border-[var(--catalog-line)] pl-4 text-sm leading-7 text-[var(--catalog-muted)]">시험값과 제조사 사양은 출처를 구분해 표시하며, 실제 적용 가능 여부는 화물과 운용조건 검토 후 확정됩니다.</p>
        </div>
        <div className="relative min-h-[390px] lg:min-h-[680px]" data-catalog-reveal>
          <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.92)_0%,rgba(231,238,233,.8)_58%,transparent_70%)]" />
          <div className="absolute right-[5%] bottom-[7%] left-[10%] h-10 rounded-[50%] bg-[rgba(23,59,47,.13)] blur-xl" />
          {imageUrl ? <Image alt="아델슨 단면형 압축성형 목재 팔레트" className="catalog-image-reveal relative z-10 object-contain object-bottom" fill priority sizes="(max-width: 1023px) 100vw, 62vw" src={imageUrl} /> : <div className="relative z-10 flex min-h-[390px] items-center justify-center border border-[var(--catalog-line)] bg-white/35 lg:min-h-[680px]"><div className="text-center text-[var(--catalog-muted)]"><PackageSearch aria-hidden="true" className="mx-auto" size={52} /><p className="mt-4 font-bold">대표 제품 원본 이미지</p></div></div>}
        </div>
      </div>
      <a aria-label="웹 카탈로그 목차로 이동" className="absolute bottom-0 left-1/2 hidden h-16 -translate-x-1/2 items-end gap-3 text-xs font-bold tracking-[0.16em] text-[var(--catalog-muted)] lg:flex" href="#catalog-guide"><span className="en pb-4">SCROLL TO EXPLORE</span><span aria-hidden="true" className="h-16 w-px bg-[var(--catalog-gold)]" /></a>
    </section>
  );
}

const guideItems = [
  ["01", "제품 이해", "#product-overview"],
  ["02", "기존 팔레트 비교", "#comparison"],
  ["03", "구조와 제조", "#structure"],
  ["04", "시험·환경 검증", "#test-2025"],
  ["05", "라인업·사양", "#lineup"],
  ["06", "적용 사례", "#applications"],
  ["07", "회사·확인 자료", "#company"],
] as const;

export function CatalogGuide() {
  return (
    <section className="scroll-mt-32 border-y border-[var(--catalog-line)] bg-white px-5 py-16 lg:scroll-mt-36 lg:px-8 lg:py-24" id="catalog-guide">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-end justify-between gap-6" data-catalog-reveal><div><p className="en text-xs font-bold tracking-[0.22em] text-[var(--catalog-green)]">CATALOG INDEX</p><h2 className="mt-3 text-3xl font-extrabold text-[var(--catalog-green-dark)]">아델슨 압축성형 목재 팔레트</h2></div><p className="hidden text-sm font-bold text-[var(--catalog-muted)] md:block">웹 카탈로그의 차례</p></div>
        <nav aria-label="웹 카탈로그 안내 목차" className="mt-10 border-t border-[var(--catalog-line)]">
          {guideItems.map(([number, label, href]) => <a className="group grid min-h-[72px] grid-cols-[52px_1fr_auto] items-center gap-4 border-b border-[var(--catalog-line)] px-2 transition-colors hover:bg-[var(--catalog-soft-green)] sm:grid-cols-[90px_1fr_260px] sm:px-5" href={href} key={href}><span className="number text-2xl font-bold text-[var(--catalog-gold)] sm:text-3xl">{number}</span><span className="text-lg font-extrabold text-[var(--catalog-green-dark)] sm:text-2xl">{label}</span><span className="en hidden items-center justify-between text-xs font-bold tracking-[0.14em] text-[var(--catalog-muted)] sm:flex">{["PRODUCT OVERVIEW", "PALLET COMPARISON", "STRUCTURE & PROCESS", "TESTED & VERIFIED", "PRODUCT LINEUP", "APPLICATION CASES", "COMPANY & DOCUMENTS"][Number(number) - 1]}<ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-2" size={19} /></span><ArrowRight aria-hidden="true" className="text-[var(--catalog-green)] transition-transform group-hover:translate-x-1 sm:hidden" size={19} /></a>)}
        </nav>
      </div>
    </section>
  );
}

export function MarketSection() {
  return (
    <section className="scroll-mt-32 bg-[var(--catalog-cream)] px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-36" id="market">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"><CatalogSectionHeading eyebrow="Why Now" title="물류 자재를 선택하는 기준이 달라지고 있습니다." description="팔레트 선택은 단순한 구매단가 비교에서 끝나지 않습니다. 수출 포장 관리, 미사용 팔레트의 보관 부피, 운송 효율, 목질 자원의 활용과 실제 설비 적합성까지 함께 검토해야 합니다." /><p className="border-l border-[var(--catalog-gold)] pl-6 text-lg leading-[1.85] text-[var(--catalog-muted)]" data-catalog-reveal>기업의 구매 기준은 제품 한 개의 가격보다 전체 물류 과정에서 발생하는 비용과 관리 부담을 함께 확인하는 방향으로 넓어지고 있습니다.</p></div>
        <div className="mt-16 border-t border-[var(--catalog-line)]">
          {marketItems.map((item, index) => <article className="grid gap-4 border-b border-[var(--catalog-line)] py-7 md:grid-cols-[90px_220px_1fr] md:items-start md:py-9" data-catalog-reveal key={item.id}><span className="number text-xl font-bold text-[var(--catalog-gold)]">0{index + 1}</span><h3 className="text-2xl font-extrabold text-[var(--catalog-green-dark)]">{item.title}</h3><p className="max-w-3xl text-base leading-[1.8] text-[var(--catalog-muted)]">{item.description}</p></article>)}
        </div>
      </div>
    </section>
  );
}

export function ProductOverviewSection({ imageUrl }: { imageUrl?: string }) {
  return (
    <section className="scroll-mt-32 bg-white px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-40" id="product-overview">
      <div className="mx-auto max-w-[1280px]">
        <ChapterHeader label="PRODUCT OVERVIEW" number="01" title="제품 이해" />
        <div className="grid gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="relative lg:sticky lg:top-[120px]" data-catalog-reveal><span aria-hidden="true" className="en absolute top-2 left-0 text-[clamp(4rem,9vw,8rem)] font-bold leading-none text-[var(--catalog-green)]/[0.045]">MOLDED</span><div className="relative aspect-[4/3] bg-[radial-gradient(circle,rgba(231,238,233,.9),transparent_68%)]">{imageUrl ? <Image alt="압축성형 목재 팔레트 제품 개요 이미지" className="catalog-image-reveal object-contain p-4" fill sizes="(max-width: 1023px) 100vw, 54vw" src={imageUrl} /> : <div className="flex h-full items-center justify-center text-[var(--catalog-muted)]">제품 이미지 입력 예정</div>}</div></div>
          <div><CatalogSectionHeading eyebrow="Product Overview" title="물류 조건을 다시 보는 제품 구조" description="압축성형 목재 팔레트는 목질 원료와 MDI계 접착 시스템을 혼합한 뒤, 금형에서 고온·고압으로 일체형 성형한 물류용 팔레트입니다." />
            <div className="mt-12 border-t border-[var(--catalog-line)]"><article className="border-b border-[var(--catalog-line)] py-8" data-catalog-reveal><h3 className="text-2xl font-extrabold text-[var(--catalog-green-dark)]">원료 구성</h3><p className="mt-4 text-lg leading-[1.8] text-[var(--catalog-muted)]">제조사 제공자료에는 폐목재, 볏짚, 대나무, 농림업 부산물과 소경목 등이 원료 후보로 설명되어 있습니다.</p><p className="mt-4 font-extrabold text-[var(--catalog-green)]">제품별 원료 구성은 별도 확인</p></article><article className="border-b border-[var(--catalog-line)] py-8" data-catalog-reveal><h3 className="text-2xl font-extrabold text-[var(--catalog-green-dark)]">MDI계 접착 시스템</h3><p className="mt-4 text-lg leading-[1.8] text-[var(--catalog-muted)]">MDI계 접착 시스템은 목질 입자를 결합해 일체형 구조를 형성하는 제조 요소입니다.</p></article></div>
            <div className="mt-4">{productOverviewCards.map((card, index) => <article className="grid grid-cols-[48px_1fr] gap-4 border-b border-[var(--catalog-line)] py-7" data-catalog-reveal key={card.id}><span className="number text-lg font-bold text-[var(--catalog-gold)]">0{index + 1}</span><div><h3 className="text-xl font-extrabold text-[var(--catalog-green-dark)]">{card.title}</h3><p className="mt-3 text-base leading-[1.75] text-[var(--catalog-muted)]">{card.description}</p></div></article>)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AdvantagesSection() {
  return (
    <section className="catalog-diagonal-cut scroll-mt-32 bg-[var(--catalog-green-dark)] px-5 py-24 text-white lg:scroll-mt-36 lg:px-8 lg:py-36" id="advantages">
      <div className="mx-auto max-w-[1280px]">
        <CatalogSectionHeading dark eyebrow="Operational Advantages" title="물류 운영에서 확인할 핵심 장점" />
        <div className="mt-14 grid border-t border-white/15 md:grid-cols-2 lg:grid-cols-4">
          {operationalAdvantages.map((advantage, index) => <article className="min-h-72 border-b border-white/15 p-7 md:border-r lg:p-8" data-catalog-reveal key={advantage.id}><span className="number text-4xl font-bold text-[var(--catalog-gold)]">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-10 text-2xl font-extrabold leading-tight text-[var(--catalog-cream)]">{advantage.title}</h3><p className="mt-5 text-base leading-[1.8] text-white/62">{advantage.description}</p></article>)}
        </div>
      </div>
    </section>
  );
}

export function ComparisonSection({ moldedImageUrl }: { moldedImageUrl?: string }) {
  return (
    <section className="scroll-mt-32 bg-[var(--catalog-warm-gray)] px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-40" id="comparison">
      <div className="mx-auto max-w-[1280px]">
        <ChapterHeader label="PALLET COMPARISON" number="02" title="기존 팔레트 비교" />
        <CatalogSectionHeading eyebrow="Product Comparison" title="기존 원목 팔레트와 무엇이 다른가" description="일반 구조 비교와 제조사 제공 비교수치는 서로 구분해 확인해야 합니다." />
        <div className="mt-14 grid overflow-hidden border border-[var(--catalog-line)] md:grid-cols-2" data-catalog-reveal>
          <figure className="bg-[var(--catalog-warm-gray)] p-6 lg:p-10">
            <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-[var(--sub-sage)] p-6 text-center text-[var(--sub-text)]">
              <div><PackageSearch aria-hidden="true" className="mx-auto" size={42} /><p className="mt-3 font-bold">기존 원목 팔레트 원본 이미지</p></div>
            </div>
            <figcaption className="mt-6"><span className="en text-xs font-bold tracking-[0.18em] text-[var(--catalog-muted)]">CONVENTIONAL</span><strong className="mt-2 block text-2xl text-[var(--catalog-charcoal)]">기존 원목 팔레트</strong></figcaption>
          </figure>
          <figure className="bg-[var(--catalog-soft-green)] p-6 lg:p-10">
            <div className="relative aspect-[4/3]">
              {moldedImageUrl ? <Image alt="비교용 아델슨 압축성형 목재 팔레트" className="object-contain p-4" fill sizes="(max-width: 767px) 100vw, 50vw" src={moldedImageUrl} /> : <div className="flex h-full items-center justify-center p-6 text-center text-[var(--sub-text)]"><div><PackageSearch aria-hidden="true" className="mx-auto" size={42} /><p className="mt-3 font-bold">압축성형 목재 팔레트 원본 이미지</p></div></div>}
            </div>
            <figcaption className="mt-6"><span className="en text-xs font-bold tracking-[0.18em] text-[var(--catalog-green)]">MOLDED</span><strong className="mt-2 block text-2xl text-[var(--catalog-green-dark)]">압축성형 목재 팔레트</strong></figcaption>
          </figure>
        </div>
        <h3 className="mt-16 text-3xl font-extrabold text-[var(--catalog-green-dark)]">일반 구조 비교</h3>
        <div className="mt-6 overflow-hidden border-y border-[var(--catalog-line)]"><div className="hidden grid-cols-[1fr_180px_1fr] bg-[var(--catalog-charcoal)] text-white md:grid"><div className="p-5 text-lg font-extrabold">기존 원목 팔레트</div><div className="border-x border-white/15 p-5 text-center font-bold text-white/60">비교 항목</div><div className="p-5 text-lg font-extrabold text-[var(--catalog-gold)]">압축성형 목재 팔레트</div></div>{generalComparison.map((row) => <article className="grid border-t border-[var(--catalog-line)] bg-white first:border-t-0 md:grid-cols-[1fr_180px_1fr]" key={row.id}><p className="p-6 text-base leading-7 text-[var(--catalog-muted)]"><span className="mb-1 block text-sm font-bold md:hidden">기존 원목 팔레트</span>{row.conventional}</p><h4 className="order-first bg-[var(--catalog-warm-gray)] p-6 text-lg font-extrabold md:order-none md:border-x md:border-[var(--catalog-line)] md:text-center">{row.label}</h4><p className="border-t border-[var(--catalog-line)] bg-[var(--catalog-soft-green)] p-6 text-base font-bold leading-7 text-[var(--catalog-green-dark)] md:border-t-0"><span className="mb-1 block text-sm font-bold md:hidden">압축성형 목재 팔레트</span>{row.molded}</p></article>)}</div>
        <div className="mt-14 flex flex-wrap items-center gap-3"><h3 className="text-2xl font-extrabold">제조사 제공 비교자료</h3><SourceBadge kind="manufacturer" /></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-5">{manufacturerComparison.map((row) => <article className="border border-[var(--catalog-gold)] bg-[var(--catalog-pale-gold)] p-5" key={row.id}><SourceBadge kind="manufacturer" /><h4 className="mt-3 text-lg font-extrabold">{row.label}</h4><dl className="mt-5 grid gap-4 text-base"><div><dt className="text-sm text-[var(--sub-text)]">기존 원목 팔레트</dt><dd className="mt-1 font-bold">{row.conventional}</dd></div><div><dt className="text-sm text-[var(--sub-text)]">압축성형 목재 팔레트</dt><dd className="mt-1 font-extrabold text-[var(--primary)]">{row.molded}</dd></div></dl><p className="mt-5 text-sm leading-6 text-[var(--sub-text)]">{row.note}</p></article>)}</div>
        <p className="mt-6 text-base leading-7 text-[var(--sub-text)]">위 수치와 비교는 제조사 제공자료를 바탕으로 한 참고정보입니다. 실제 비용, 적재수량과 적용 가능 여부는 제품 모델, 포장방식과 운송조건에 따라 달라질 수 있습니다.</p>
      </div>
    </section>
  );
}

export function StructureSection({ imageUrl }: { imageUrl?: string }) {
  const imageSlots = [
    { id: "top", label: "대표 제품 상부 이미지", src: imageUrl },
    { id: "bottom", label: "대표 제품 하부 이미지" },
    { id: "reinforcement", label: "하부 보강 구조 클로즈업" },
    { id: "nesting", label: "제품 중첩 상태 이미지" },
  ];
  return (
    <section className="catalog-grid-surface scroll-mt-32 px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-40" id="structure">
      <div className="mx-auto max-w-[1280px]">
        <ChapterHeader label="STRUCTURE & MANUFACTURING" number="03" title="구조와 제조" />
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          <div className="grid grid-cols-2 gap-px bg-[var(--catalog-line)] border border-[var(--catalog-line)]" data-catalog-reveal>{imageSlots.map((slot) => <figure className="bg-[var(--catalog-cream)] p-3" key={slot.id}><div className="relative aspect-[4/3]">{slot.src ? <Image alt={slot.label} className="object-contain p-3" fill sizes="(max-width: 1023px) 50vw, 26vw" src={slot.src} /> : <div className="flex h-full items-center justify-center border border-dashed border-[var(--sub-sage)] p-3 text-center text-sm font-bold text-[var(--sub-text)]">{slot.label}</div>}</div><figcaption className="border-t border-[var(--catalog-line)] pt-3 text-xs font-bold tracking-[0.04em] text-[var(--catalog-muted)]">{slot.label}</figcaption></figure>)}</div>
          <div><CatalogSectionHeading eyebrow="Product Structure" title="금형 일체형 구조와 주요 구성" /><div className="mt-10 border-t border-[var(--catalog-line)]">{productStructureItems.map((item, index) => <article className="grid grid-cols-[52px_1fr] gap-4 border-b border-[var(--catalog-line)] py-6" data-catalog-reveal key={item.id}><span aria-hidden="true" className="number text-xl font-bold text-[var(--catalog-gold)]">0{index + 1}</span><div><h3 className="text-xl font-extrabold text-[var(--catalog-green-dark)]">{item.title}</h3><p className="mt-2 text-base leading-7 text-[var(--catalog-muted)]">{item.description}</p></div></article>)}</div></div>
        </div>
      </div>
    </section>
  );
}

export function ManufacturingSection() {
  return (
    <section className="scroll-mt-32 bg-white px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-36" id="manufacturing">
      <div className="mx-auto max-w-[1280px]"><CatalogSectionHeading eyebrow="Structure & Manufacturing" title="원료 준비부터 검사·출하까지" description="제조사 제공자료를 바탕으로 확인된 7단계 공정을 순서대로 구성했습니다." /><div className="mt-14 grid gap-10 lg:grid-cols-[0.36fr_0.64fr]"><div className="flex min-h-64 items-center justify-center border border-dashed border-[var(--sub-sage)] bg-[var(--catalog-warm-gray)] p-6 text-center text-[var(--sub-text)]" data-catalog-reveal><div><Factory aria-hidden="true" className="mx-auto" size={46} /><p className="mt-3 font-extrabold">편집 완료된 실제 생산라인 이미지</p><p className="mt-2 text-sm">원본 확인 후 연결</p></div></div><ol className="relative border-l border-[var(--catalog-green)] pl-8">{manufacturingProcess.map((step, index) => <li className="relative grid gap-3 border-b border-[var(--catalog-line)] py-6 first:pt-0 sm:grid-cols-[70px_1fr]" data-catalog-reveal key={step.id}><span aria-hidden="true" className="absolute top-8 -left-[37px] h-4 w-4 rounded-full border-4 border-white bg-[var(--catalog-gold)] first:top-2" /><span className="number text-3xl font-bold text-[var(--catalog-gold)]">{String(index + 1).padStart(2, "0")}</span><div><h3 className="text-xl font-extrabold leading-tight text-[var(--catalog-green-dark)]">{step.title}</h3><p className="mt-3 text-base leading-[1.75] text-[var(--catalog-muted)]">{step.description}</p></div></li>)}</ol></div><p className="mt-8 border-l-2 border-[var(--catalog-gold)] bg-[var(--catalog-pale-gold)] p-5 text-base leading-7 text-[var(--catalog-muted)]">제조공정 전체가 독립 시험기관에 의해 검증됐다는 의미가 아니며, 실제 설비 이미지만 사용합니다.</p></div>
    </section>
  );
}

export function TestNavigation() {
  return (
    <section className="bg-[var(--catalog-charcoal)] px-5 pt-24 text-white lg:px-8 lg:pt-36">
      <div className="mx-auto max-w-[1280px]">
        <ChapterHeader dark label="TESTED & VERIFIED" number="04" title="시험·환경 검증" />
        <p className="en text-[clamp(3rem,8vw,7.5rem)] font-bold leading-none tracking-[-0.055em] text-[var(--catalog-cream)]" data-catalog-reveal>Tested &amp;<br />Verified</p>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">제3자 시험, SGS 검증과 제조사 제시 사양을 서로 다른 출처 체계로 구분해 확인합니다.</p>
        <nav aria-label="시험·검증 바로가기" className="no-scrollbar sticky top-16 z-30 mt-12 flex gap-px overflow-x-auto border-y border-white/15 bg-[rgba(37,42,39,.94)] backdrop-blur lg:top-[76px]">
          {[["2025 시험", "#test-2025"], ["2026 TBK 시험", "#test-2026"], ["포름알데히드", "#formaldehyde"], ["탄소발자국", "#carbon-footprint"]].map(([label, href], index) => <a className="flex min-h-14 shrink-0 items-center gap-3 border-r border-white/15 px-5 font-bold text-white/64 transition hover:bg-white/8 hover:text-white" href={href} key={href}><span className="number text-[var(--catalog-gold)]">0{index + 1}</span>{label}</a>)}
        </nav>
      </div>
    </section>
  );
}

function PhysicalTestSection({ test }: { test: TestResult }) {
  return (
    <section className="scroll-mt-32 bg-[var(--catalog-charcoal)] px-5 py-24 text-white lg:scroll-mt-36 lg:px-8 lg:py-32" id={test.id}>
      <div className="mx-auto max-w-[1280px]"><div className="flex flex-wrap items-center gap-3"><SourceBadge kind="third-party" label="시험기관 발행자료" /><span className="number text-base font-bold text-white/48">{test.reportNumber}</span></div><CatalogSectionHeading dark eyebrow="Physical Performance Test" title={test.reportTitle} description="시험기관 발행자료의 제출 시료, 시험조건과 결과를 분리해 확인합니다." />
        <div className="mt-14 grid gap-10 lg:grid-cols-[0.42fr_1fr]"><dl className="grid content-start gap-5 border-y border-white/15 py-7 text-base">{[["시험기관", test.issuer], ["발급일", test.issueDate], ["시험기간", test.testPeriod], ["시험방법", test.method || "보고서 항목별 방법"]].map(([label, value]) => <div key={label}><dt className="text-xs font-bold tracking-[0.08em] text-white/42">{label}</dt><dd className="mt-2 font-extrabold text-[var(--catalog-cream)]">{value}</dd></div>)}<div><dt className="text-xs font-bold tracking-[0.08em] text-white/42">제출 시료</dt><dd className="mt-2 grid gap-1 font-bold text-[var(--catalog-cream)]">{test.sample.map((item) => <span key={item}>{item}</span>)}</dd></div>{test.environment?.length ? <div><dt className="text-xs font-bold tracking-[0.08em] text-white/42">시험환경</dt><dd className="mt-2 font-bold text-[var(--catalog-cream)]">{test.environment.join(" · ")}</dd></div> : null}</dl>
          <div className="grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-3">{test.metrics.map((metric, index) => <article className="min-h-56 border-r border-b border-white/15 py-7 pr-5 sm:px-6" data-catalog-reveal key={metric.id}><span className="number text-xs text-[var(--catalog-gold)]">{String(index + 1).padStart(2, "0")}</span><p className="mt-5 text-sm font-bold text-white/48">{metric.name}</p><p className="number mt-4 break-words text-[clamp(2rem,3.8vw,3.7rem)] font-bold leading-none text-[var(--catalog-gold)]">{metric.value}</p><p className="mt-5 text-sm leading-6 text-white/48">기준 {metric.referenceValue} · 판정 {metric.judgement}</p>{metric.note ? <p className="mt-2 text-sm font-bold text-[var(--alert)]">* {metric.note}</p> : null}</article>)}</div></div>
        {test.id === "test-2026" ? <div className="mt-8 grid gap-4 sm:grid-cols-3">{["시료 사진", "포크 인양 시험 사진", "상판 집중하중 시험 사진"].map((label) => <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-white/28 bg-white/5 p-4 text-center text-sm font-bold text-white/55" key={label}>{label}</div>)}</div> : null}
        <ul className="mt-10 border-l-2 border-[var(--catalog-gold)] bg-white/[0.045] p-6 text-base leading-8 text-white/58">{test.limitations.map((item) => <li key={item}>· {item}</li>)}</ul>
      </div>
    </section>
  );
}

export function Test2025Section() { return <PhysicalTestSection test={physicalTests[0]} />; }
export function Test2026Section() { return <PhysicalTestSection test={physicalTests[1]} />; }

export function FormaldehydeSection() {
  return (
    <section className="scroll-mt-32 bg-[var(--catalog-green-dark)] px-5 py-24 text-white lg:scroll-mt-36 lg:px-8 lg:py-32" id="formaldehyde"><div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-center"><div data-catalog-reveal><SourceBadge kind="third-party" label="시험기관 발행자료" /><CatalogSectionHeading dark eyebrow="Formaldehyde Emission Test" title="포름알데히드 방출량 시험" /><p className="number mt-10 text-[clamp(4rem,9vw,8.5rem)] font-bold leading-none text-[var(--catalog-gold)]">{formaldehydeTest.result}</p><p className="mt-5 text-lg font-extrabold text-[var(--catalog-cream)]">제출 시료의 포름알데히드 방출량 측정값</p></div><div><dl className="grid border-t border-white/15 sm:grid-cols-2">{[["시험기관", formaldehydeTest.issuer], ["보고서", formaldehydeTest.reportNumber], ["발급일", formaldehydeTest.issueDate], ["시료", formaldehydeTest.sample], ["시험기간", formaldehydeTest.testPeriod], ["시험환경", formaldehydeTest.environment], ["시험방법", formaldehydeTest.method], ["시험장비", formaldehydeTest.equipment], ["방법검출한계", formaldehydeTest.detectionLimit]].map(([label, value]) => <div className="border-r border-b border-white/15 p-5" key={label}><dt className="text-xs font-bold tracking-[0.08em] text-white/42">{label}</dt><dd className="mt-2 break-words text-base font-extrabold text-[var(--catalog-cream)]">{value}</dd></div>)}</dl><p className="mt-7 border-l-2 border-[var(--catalog-gold)] bg-white/[0.05] p-5 text-base leading-7 text-white/58">이 보고서에는 적합 기준과 합격 판정이 기재되어 있지 않습니다. 시험결과는 제출 시료에 한해 적용됩니다.</p></div></div></section>
  );
}

export function CarbonFootprintSection() {
  const max = Math.max(...carbonFootprint.stages.map((stage) => Math.abs(stage.value)));
  return (
    <section className="scroll-mt-32 bg-[var(--catalog-pale-gold)] px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-36" id="carbon-footprint"><div className="mx-auto max-w-[1280px]"><SourceBadge kind="sgs" /><CatalogSectionHeading eyebrow="Product Carbon Footprint" title="제품 탄소발자국 검증" description={`${carbonFootprint.model} 모델 팔레트 1개를 기능단위로 한 ${carbonFootprint.boundary} 평가입니다.`} /><div className="mt-14 grid gap-10 lg:grid-cols-[0.65fr_1.35fr]"><article className="bg-[var(--catalog-green-dark)] p-8 text-white lg:p-10" data-catalog-reveal><p className="text-sm font-bold tracking-[0.08em] text-white/48">총 탄소발자국</p><p className="number mt-6 text-[clamp(3.5rem,7vw,6.5rem)] font-bold leading-none text-[var(--catalog-gold)]">{carbonFootprint.total}</p><p className="number mt-3 text-xl text-[var(--catalog-cream)]">kg CO₂e</p><dl className="mt-10 grid gap-5 border-t border-white/15 pt-7 text-base"><div><dt className="text-white/42">문서번호</dt><dd className="mt-1 font-bold">{carbonFootprint.documentNumber}</dd></div><div><dt className="text-white/42">표준</dt><dd className="mt-1 font-bold">{carbonFootprint.standard}</dd></div><div><dt className="text-white/42">평가범위</dt><dd className="mt-1 font-bold">{carbonFootprint.boundary}</dd></div></dl></article><div className="border-y border-[var(--catalog-line)] py-8" data-catalog-reveal><h3 className="text-xl font-extrabold text-[var(--catalog-green-dark)]">수명주기 단계별 값</h3><div className="relative mt-10 grid h-80 grid-cols-4 gap-5 border-y border-[var(--catalog-line)]"><span aria-hidden="true" className="absolute top-2/3 right-0 left-0 h-px bg-[var(--catalog-charcoal)]/35" />{carbonFootprint.stages.map((stage) => <div className="relative" key={stage.id}><div className="absolute right-0 bottom-[33.333%] left-0 flex flex-col items-center justify-end">{stage.value >= 0 ? <div className="w-3/5 bg-[var(--catalog-green)]" style={{ height: `${Math.abs(stage.value) / max * 180}px` }} /> : null}</div><div className="absolute top-[66.666%] right-0 left-0 flex flex-col items-center">{stage.value < 0 ? <div className="w-3/5 bg-[var(--catalog-gold)]" style={{ height: `${Math.abs(stage.value) / max * 90}px` }} /> : null}</div><div className="absolute right-0 bottom-4 left-0 text-center"><p className="text-sm font-bold">{stage.label}</p><p className="number mt-1 text-xs font-bold text-[var(--catalog-green-dark)]">{stage.value.toFixed(4)}</p></div></div>)}</div><p className="mt-4 text-right text-xs font-bold text-[var(--catalog-muted)]">단위 kg CO₂e · 골드 막대는 음수값</p></div></div><p className="mt-8 border-l-2 border-[var(--catalog-gold)] pl-5 text-base leading-7 text-[var(--catalog-muted)]">이 수치는 AD-11001100-93 모델 1개에 대한 검증값이며, 다른 규격과 제품군의 값으로 확대 적용하지 않습니다.</p></div></section>
  );
}

export function LineupSection({ imageUrls }: { imageUrls: Array<string | undefined> }) {
  return (
    <section className="scroll-mt-32 bg-[var(--catalog-cream)] px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-40" id="lineup"><div className="mx-auto max-w-[1280px]"><ChapterHeader label="PRODUCT LINEUP & DATA SHEET" number="05" title="라인업·사양" /><CatalogSectionHeading eyebrow="Product Lineup" title="4개 제품군" description="화물, 적재 방식과 설비 조건을 기준으로 제품군을 비교합니다." /><div className="mt-14 grid gap-6 md:grid-cols-2">{productFamilies.map((product, index) => <article className={`group relative flex min-h-[560px] flex-col overflow-hidden border border-[var(--catalog-line)] ${index % 3 === 1 ? "bg-[var(--catalog-soft-green)]" : index % 3 === 2 ? "bg-[var(--catalog-pale-gold)]" : "bg-white"}`} data-catalog-reveal key={product.id}><span aria-hidden="true" className="number pointer-events-none absolute top-3 right-5 text-[clamp(6rem,12vw,11rem)] font-bold leading-none text-[var(--catalog-green)]/[0.055]">{String(index + 1).padStart(2, "0")}</span><div className="relative min-h-[330px] flex-1">{imageUrls[index] ? <Image alt={product.title} className="object-contain p-8 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.035]" fill sizes="(max-width: 767px) 100vw, 50vw" src={imageUrls[index]!} /> : <div className="flex h-full items-center justify-center text-[var(--sub-sage)]"><PackageSearch aria-hidden="true" size={48} /></div>}</div><div className="relative border-t border-[var(--catalog-line)] p-6 lg:p-8"><div className="flex flex-wrap items-center gap-3"><span className="en text-xs font-bold uppercase tracking-[0.16em] text-[var(--catalog-green)]">{product.englishLabel}</span><span className="border-l border-[var(--catalog-gold)] pl-3 text-sm font-extrabold text-[var(--catalog-green-dark)]">{product.series} SERIES</span></div><h3 className="mt-4 flex items-center gap-3 text-2xl font-extrabold text-[var(--catalog-green-dark)]">{product.title}<ArrowRight aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-2" size={20} /></h3><p className="mt-4 text-base leading-[1.75] text-[var(--catalog-muted)]">{product.description}</p><ul className="mt-6 grid gap-3 border-t border-[var(--catalog-line)] pt-5 text-base sm:grid-cols-2">{product.features.map((feature) => <li className="flex gap-2" key={feature}><Check aria-hidden="true" className="mt-1 shrink-0 text-[var(--catalog-green)]" size={18} />{feature}</li>)}</ul></div></article>)}</div></div></section>
  );
}

const summarySpecs = [
  { model: "AD 계열", type: "단면형", size: "1200 × 1000 × 130mm 등", dynamicLoad: "2,000kg", staticLoad: "8,000kg", usage: "일반 수출 포장·보관" },
  { model: "AC 계열", type: "3열 받침형", size: "1000 × 1000 × 145mm 등", dynamicLoad: "2,500kg", staticLoad: "9,000kg", usage: "고중량 화물·지게차 운용" },
  { model: "AS 계열", type: "양면형", size: "1100 × 1100 × 145mm 등", dynamicLoad: "2,800kg", staticLoad: "10,000kg", usage: "고중량 산업재" },
];

export function SpecificationsSection() {
  return (
    <section className="scroll-mt-32 bg-white px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-36" id="specifications"><div className="mx-auto max-w-[1440px]"><div className="mx-auto max-w-[1280px]"><div className="flex flex-wrap items-end justify-between gap-4"><CatalogSectionHeading eyebrow="Model Specifications" title="전체 모델 사양" /><SourceBadge kind="manufacturer-spec" /></div><div className="mt-12 grid border-y border-[var(--catalog-line)] md:grid-cols-3">{summarySpecs.map((spec) => <article className="border-b border-[var(--catalog-line)] py-7 md:border-r md:border-b-0 md:px-7 first:pl-0 last:border-r-0" key={spec.model}><p className="en text-3xl font-bold text-[var(--catalog-green-dark)]">{spec.model.replace(" 계열", "")}</p><p className="mt-2 font-extrabold">{spec.type} · {spec.size}</p><dl className="number mt-6 grid grid-cols-2 gap-4"><div><dt className="text-xs font-bold text-[var(--catalog-muted)]">DYNAMIC</dt><dd className="mt-1 text-2xl font-bold text-[var(--catalog-green)]">{spec.dynamicLoad}</dd></div><div><dt className="text-xs font-bold text-[var(--catalog-muted)]">STATIC</dt><dd className="mt-1 text-2xl font-bold text-[var(--catalog-green)]">{spec.staticLoad}</dd></div></dl><p className="mt-5 text-sm text-[var(--catalog-muted)]">{spec.usage}</p></article>)}</div><h3 className="mt-16 text-3xl font-extrabold text-[var(--catalog-green-dark)]">전체 모델 찾기</h3></div><ModelSpecificationsExplorer specifications={allModelSpecifications} /><p className="mt-8 border-l-2 border-[var(--catalog-gold)] bg-[var(--catalog-pale-gold)] p-5 text-base leading-8 text-[var(--catalog-muted)]">상기 하중은 제조사 제시 사양입니다. 실제 적용 가능 여부는 화물의 크기, 중량, 하중분포, 랙 구조, 지게차와 자동화 설비 조건 검토 후 확정됩니다.</p></div></section>
  );
}

export function ApplicationCheckSection() {
  return (
    <section className="scroll-mt-32 bg-[var(--catalog-green-dark)] px-5 py-24 text-white lg:scroll-mt-36 lg:px-8 lg:py-32" id="application-check"><div className="mx-auto max-w-[1280px]"><CatalogSectionHeading dark eyebrow="Application Check" title="제품 선택 전 확인해야 할 운용조건" /><div className="mt-14 border-t border-white/15">{applicationCheckGroups.map((group, index) => <details className="group border-b border-white/15" key={group.id} open={index === 0 ? true : undefined}><summary className="grid min-h-24 cursor-pointer list-none grid-cols-[58px_1fr_auto] items-center gap-4 py-5"><span className="number text-3xl font-bold text-[var(--catalog-gold)]">{String(index + 1).padStart(2, "0")}</span><h3 className="text-xl font-extrabold text-[var(--catalog-cream)] sm:text-2xl">{group.title}</h3><span aria-hidden="true" className="number text-2xl text-white/45 transition-transform group-open:rotate-45">+</span></summary><ul className="grid gap-3 pb-8 pl-[74px] text-base leading-7 text-white/62 sm:grid-cols-2 lg:grid-cols-4">{group.fields.map((field) => <li className="border-l border-white/15 pl-3" key={field}>{field}</li>)}</ul></details>)}</div><div className="mt-12 flex flex-col gap-6 border border-[var(--catalog-gold)] p-7 sm:flex-row sm:items-center sm:justify-between"><p className="text-xl font-extrabold leading-8 text-[var(--catalog-cream)]">화물과 설비 조건을 알려주시면<br />적용 가능한 제품군을 검토합니다.</p><a className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 bg-[var(--catalog-gold)] px-6 font-extrabold text-[var(--catalog-green-dark)]" href="#contact">운용조건 검토 요청<ArrowRight aria-hidden="true" size={18} /></a></div></div></section>
  );
}

export function ApplicationsSection({ cases }: { cases: CatalogApplicationCase[] }) {
  return <section className="scroll-mt-32 bg-[var(--catalog-cream)] px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-40" id="applications"><div className="mx-auto max-w-[1280px]"><ChapterHeader label="CUSTOMER APPLICATIONS" number="06" title="적용 사례" /><CatalogSectionHeading eyebrow="Customer Applications" title="화물과 물류 환경별 적용 사례" /><CatalogApplicationExplorer cases={cases} /></div></section>;
}

export function CompanySection({ factoryImage }: { factoryImage?: string }) {
  return (
    <section className="scroll-mt-32 bg-[var(--catalog-green-dark)] py-24 text-white lg:scroll-mt-36 lg:py-36" id="company"><div className="mx-auto max-w-[1440px] px-5 lg:px-8"><ChapterHeader dark label="COMPANY & DOCUMENTS" number="07" title="회사·확인 자료" /><div className="relative min-h-[440px] overflow-hidden bg-[var(--catalog-charcoal)]" data-catalog-reveal>{factoryImage ? <Image alt="제조사 생산시설 전경" className="catalog-image-reveal object-cover" fill sizes="100vw" src={factoryImage} /> : <div className="flex min-h-[440px] items-center justify-center text-white/38"><Factory aria-hidden="true" size={52} /><span className="ml-3 font-bold">제조사 생산시설 전경</span></div>}<div className="absolute inset-0 bg-gradient-to-t from-[var(--catalog-green-dark)] via-transparent to-transparent" /><div className="absolute right-0 bottom-0 left-0 p-7 lg:p-12"><p className="en text-xs font-bold tracking-[0.2em] text-[var(--catalog-gold)]">COMPANY &amp; MANUFACTURING</p><h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] font-extrabold text-[var(--catalog-cream)]">회사 및 생산 역량</h2></div></div>
      <div className="grid gap-10 border-b border-white/15 py-12 lg:grid-cols-[0.72fr_1.28fr]"><article><h3 className="text-3xl font-extrabold text-[var(--catalog-cream)]">아델슨 코리아</h3><p className="mt-5 text-lg leading-[1.8] text-white/62">아델슨 코리아는 국내 제품 안내, 적용 검토와 견적 상담을 담당합니다.</p></article><dl className="grid gap-5 text-base sm:grid-cols-3"><div className="border-l border-white/15 pl-5"><dt className="text-xs font-bold tracking-[0.08em] text-white/42">전화</dt><dd className="mt-2 font-bold"><a href={siteConfig.contact.phoneHref}>{siteConfig.contact.phoneDisplay}</a></dd></div><div className="border-l border-white/15 pl-5"><dt className="text-xs font-bold tracking-[0.08em] text-white/42">이메일</dt><dd className="mt-2 break-all font-bold"><a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a></dd></div><div className="border-l border-white/15 pl-5"><dt className="text-xs font-bold tracking-[0.08em] text-white/42">주소</dt><dd className="mt-2 font-bold">{siteConfig.contact.address}</dd></div></dl></div>
      <div className="mt-14 flex flex-wrap items-center gap-3"><h3 className="text-3xl font-extrabold text-[var(--catalog-cream)]">제조사 제공 생산 기반</h3><SourceBadge kind="manufacturer" /></div><div className="mt-8 grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">{companyCapabilities.map((item) => <article className="min-h-56 border-r border-b border-white/15 py-7 pr-5 sm:px-6" data-catalog-reveal key={item.id}><SourceBadge kind="manufacturer" /><p className="number mt-6 text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none text-[var(--catalog-gold)]">{item.value}</p><h4 className="mt-5 text-lg font-extrabold text-[var(--catalog-cream)]">{item.label}</h4><p className="mt-2 text-base leading-7 text-white/52">{item.description}</p></article>)}</div><p className="mt-7 border-l-2 border-[var(--catalog-gold)] pl-5 text-base leading-7 text-white/55">위 수치는 제조사 제공자료 기준이며, 관련 산업 경험은 현재 법인 설립연도와 동일한 의미가 아닙니다.</p><div className="mt-16 border-y border-white/15 py-8"><p className="en text-xs font-bold tracking-[0.2em] text-[var(--catalog-gold)]">GLOBAL FOOTPRINT</p><div className="mt-6 grid gap-6 sm:grid-cols-3"><div><p className="text-sm text-white/42">생산기지</p><p className="mt-2 text-xl font-extrabold">화동 · 화중 · 화남</p></div><div><p className="text-sm text-white/42">마케팅센터</p><p className="mt-2 text-xl font-extrabold">상하이 · 허페이</p></div><div><p className="text-sm text-white/42">국제 R&amp;D</p><p className="mt-2 text-xl font-extrabold">독일 뒤셀도르프</p></div></div></div></div></section>
  );
}

export function RndQualitySection() {
  return <section className="catalog-grid-surface scroll-mt-32 px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-36" id="rnd-quality"><div className="mx-auto max-w-[1280px]"><CatalogSectionHeading eyebrow="R&D and Quality" title="설계, 생산과 검사로 이어지는 품질관리" /><RndQualityTabs /></div></section>;
}

export function DocumentsSection({ documents = catalogDocuments }: { documents?: CatalogDocument[] }) {
  return <section className="scroll-mt-32 bg-white px-5 py-24 lg:scroll-mt-36 lg:px-8 lg:py-36" id="documents"><div className="mx-auto max-w-[1280px]"><CatalogSectionHeading eyebrow="Official Documents" title="공식 문서 자료실" description="각 문서가 증명하는 제품, 기간과 범위 안에서 확인하며 공개 권한에 따라 원문 보기 또는 자료 문의를 제공합니다." /><CatalogDocumentLibrary documents={documents} /></div></section>;
}

export function ApplicationReviewSection() {
  return <section className="scroll-mt-32 border-b border-white/12 bg-[var(--catalog-green-dark)] px-5 py-20 text-white lg:scroll-mt-36 lg:px-8 lg:py-28" id="application-review"><div className="mx-auto flex max-w-[1280px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between"><div data-catalog-reveal><p className="en text-xs font-bold uppercase tracking-[0.22em] text-[var(--catalog-gold)]">Application Review</p><h2 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-tight text-[var(--catalog-cream)]">실제 운용조건을 기준으로 검토하세요.</h2><p className="mt-6 max-w-3xl text-lg leading-[1.8] text-white/62">화물 규격과 중량, 팔레트 크기, 랙·지게차 조건, 월 사용량과 목적국을 알려주시면 적용 가능한 제품군을 함께 검토합니다.</p></div><a className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 bg-[var(--catalog-gold)] px-6 font-extrabold text-[var(--catalog-green-dark)] transition hover:-translate-y-0.5" href="#contact">견적·적용 문의<ArrowRight aria-hidden="true" size={18} /></a></div></section>;
}
