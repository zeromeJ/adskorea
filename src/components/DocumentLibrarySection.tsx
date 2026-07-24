"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import SectionTitle from "@/components/ui/SectionTitle";
import { documents as fallbackDocuments } from "@/lib/constants";
import type { KoreanDocumentSummary, LifecycleStage } from "@/lib/documentSummaries";

export type DocumentItem = {
  title: string;
  documentType: string;
  issuer: string;
  reportNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  relatedProducts?: string;
  language: string;
  fileUrl: string;
  previewUrl?: string;
  publicPreview?: boolean;
  previewAvailable?: boolean;
  summary?: string;
  thumbnailUrl?: string;
  koreanSummary?: KoreanDocumentSummary;
};

export default function DocumentLibrarySection({
  items = fallbackDocuments,
}: {
  items?: DocumentItem[];
}) {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [openSummaries, setOpenSummaries] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<DocumentItem | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const visibleItems = useMemo(
    () => items.filter((item) => item.title && item.documentType && item.issuer && item.issueDate),
    [items],
  );
  const categories = useMemo(
    () => Array.from(new Set(visibleItems.map((item) => item.documentType))),
    [visibleItems],
  );
  const filterCategories = categories.length > 1 ? ["전체", ...categories] : categories;
  const updateScrollState = useCallback(() => {
    const element = filterRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateScrollState();
    const element = filterRef.current;
    if (!element) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(element);
    window.addEventListener("resize", updateScrollState);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  useEffect(() => {
    const selectedButton = Array.from(
      filterRef.current?.querySelectorAll<HTMLButtonElement>("[data-filter-category]") ?? [],
    ).find((button) => button.dataset.filterCategory === category);
    selectedButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [category]);

  useEffect(() => {
    if (!previewItem) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewItem(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [previewItem]);

  function scrollFilters(direction: -1 | 1) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    filterRef.current?.scrollBy({ left: direction * 280, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function toggleSummary(key: string) {
    setOpenSummaries((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    return visibleItems.filter((item) => {
      const matchesCategory = category === "전체" || item.documentType === category;
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.issuer, item.relatedProducts ?? ""]
          .join(" ")
          .toLocaleLowerCase("ko-KR")
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, visibleItems]);

  return (
    <section id="documents" className="bg-[var(--background)] px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Document Center"
          title="기술자료·시험·인증"
          description="제품 검토에 필요한 기술자료, 시험성적서, 검증자료와 공개 문서를 확인할 수 있습니다."
        />
        <div className="mt-8 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          {filterCategories.length > 1 ? <div className="relative min-w-0">
            <div
              aria-label="문서 유형 필터"
              className={`no-scrollbar flex max-w-full gap-2 pb-2 ${filterCategories.length <= 3 ? "flex-wrap overflow-visible whitespace-normal" : "touch-horizontal-scroller overflow-x-auto overflow-y-hidden pr-8 whitespace-nowrap"}`}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                const buttons = Array.from(filterRef.current?.querySelectorAll<HTMLButtonElement>("[data-filter-category]") ?? []);
                const activeIndex = Math.max(0, buttons.findIndex((button) => button.dataset.filterCategory === category));
                const nextIndex = Math.min(buttons.length - 1, Math.max(0, activeIndex + (event.key === "ArrowLeft" ? -1 : 1)));
                const nextButton = buttons[nextIndex];
                if (nextButton?.dataset.filterCategory) {
                  setCategory(nextButton.dataset.filterCategory);
                  nextButton.focus();
                }
              }}
              onScroll={updateScrollState}
              ref={filterRef}
              role="toolbar"
              tabIndex={0}
            >
              {filterCategories.map((item) => (
                <button
                  aria-pressed={category === item}
                  className={`min-h-10 shrink-0 rounded-md border px-3 text-xs font-bold ${category === item ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--line)] bg-white text-[var(--text)]"}`}
                  data-filter-category={item}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >{item}</button>
              ))}
            </div>
            {filterCategories.length > 3 && canScrollRight ? <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-10 w-12 bg-gradient-to-l from-[var(--background)] to-transparent" /> : null}
            {filterCategories.length > 3 && canScrollLeft ? <button aria-label="이전 문서 유형 보기" className="absolute top-1/2 left-0 hidden h-8 w-8 -translate-y-[60%] items-center justify-center rounded-full border border-[var(--line)] bg-white font-bold shadow-sm focus-visible:outline-2 focus-visible:outline-[var(--primary)] md:flex" onClick={() => scrollFilters(-1)} type="button">‹</button> : null}
            {filterCategories.length > 3 && canScrollRight ? <button aria-label="다음 문서 유형 보기" className="absolute top-1/2 right-0 hidden h-8 w-8 -translate-y-[60%] items-center justify-center rounded-full border border-[var(--line)] bg-white font-bold shadow-sm focus-visible:outline-2 focus-visible:outline-[var(--primary)] md:flex" onClick={() => scrollFilters(1)} type="button">›</button> : null}
          </div> : <div />}
          <input
            aria-label="기술자료·시험·인증 문서 검색"
            className="min-h-11 rounded-md border border-[var(--line)] bg-white px-4 text-sm outline-none focus:border-[var(--primary)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="문서명·기관·제품 검색"
            type="search"
            value={query}
          />
        </div>

        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          {filteredItems.map((item, index) => {
            const itemKey = item.reportNumber || item.title;
            const isOpen = openSummaries.has(itemKey);
            const summary = item.koreanSummary?.published ? item.koreanSummary : undefined;
            const previewUrl = item.previewUrl || item.fileUrl;
            return (
              <article className="min-w-0 overflow-hidden rounded-lg border border-[var(--line)] bg-white" key={itemKey}>
                <div className="grid min-w-0 grid-cols-[104px_minmax(0,1fr)] gap-5 p-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6">
                  {item.thumbnailUrl ? (
                    <MediaPlaceholder
                      alt={`${item.title} 문서 표지`}
                      className="self-center"
                      desktopRatio="210:297"
                      emptyLabel="썸네일을 불러오지 못했습니다"
                      expandable={false}
                      fieldName={`performance.document${index + 1}.thumbnail`}
                      guide="공개 문서 A4 표지"
                      label="문서 썸네일"
                      mediaType="document"
                      mobileRatio="210:297"
                      src={item.thumbnailUrl}
                    />
                  ) : (
                    <div className="flex aspect-[210/297] items-center justify-center self-center overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--muted-surface)] px-3 text-center text-xs font-bold leading-5 text-[var(--sub-text)]">
                      썸네일 준비 중
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className="w-fit max-w-full rounded-md bg-[var(--sub-mint)] px-2 py-1 text-[9px] leading-4 font-bold text-[var(--primary-dark)] [overflow-wrap:anywhere]">
                      {item.documentType}
                    </span>
                    <h3 className="mt-1.5 [overflow-wrap:anywhere] leading-6 font-bold text-[var(--text)]">{item.title}</h3>
                    <dl className="mt-2 grid gap-1 text-xs leading-5 text-[var(--sub-text)] [&>div]:[overflow-wrap:anywhere]">
                      <div>발급기관: {item.issuer}</div>
                      {item.reportNumber ? <div>문서번호: {item.reportNumber}</div> : null}
                      {item.issueDate ? <div>발급일: {item.issueDate}</div> : null}
                      {item.language ? <div>원문 언어: {item.language}</div> : null}
                    </dl>
                  </div>
                  <div className="col-span-full grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                    {summary ? (
                      <button
                        aria-controls={`summary-${index}`}
                        aria-expanded={isOpen}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--sub-mint)] px-3 py-2 text-[11px] font-bold text-[var(--primary-dark)] transition-colors hover:bg-[var(--sub-sage)]"
                        onClick={() => toggleSummary(itemKey)}
                        type="button"
                      >
                        {isOpen ? "한국어 요약 닫기" : "한국어 요약 보기"}
                        <ChevronIcon open={isOpen} />
                      </button>
                    ) : (
                      <span aria-disabled="true" className="inline-flex min-h-11 items-center justify-center rounded-md bg-black/[0.035] px-3 py-2 text-[11px] font-bold text-[var(--sub-text)]/55">한국어 요약 준비 중</span>
                    )}
                    <button
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--primary)] px-3 py-2 text-[11px] font-bold text-[var(--primary-dark)] transition-colors hover:bg-[var(--muted-surface)] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--sub-text)]/45"
                      disabled={!previewUrl}
                      onClick={() => previewUrl && setPreviewItem(item)}
                      type="button"
                    >
                      원문 미리보기
                    </button>
                  </div>
                </div>
                {summary ? (
                  <div
                    aria-hidden={!isOpen}
                    className={`grid border-t border-[var(--line)] bg-[var(--muted-surface)]/55 transition-[grid-template-rows,opacity] duration-[240ms] ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    id={`summary-${index}`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <KoreanSummaryContent summary={summary} />
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        {filteredItems.length === 0 ? <p className="mt-6 rounded-lg border border-[var(--line)] bg-white p-5 text-sm text-[var(--sub-text)]">조건에 맞는 공개 문서가 없습니다.</p> : null}
      </div>
      {previewItem ? <PdfPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} /> : null}
    </section>
  );
}

function KoreanSummaryContent({ summary }: { summary: KoreanDocumentSummary }) {
  return (
    <div className="grid min-w-0 gap-7 p-4 sm:p-5">
      <SummarySection title="1. 문서 개요">
        <dl className="grid min-w-0 gap-x-5 gap-y-3 min-[480px]:grid-cols-2">
          {summary.overview.map((item) => <div className="min-w-0" key={`${item.label}-${item.value}`}><dt className="text-xs font-bold text-[var(--sub-text)]">{item.label}</dt><dd className="mt-1 [overflow-wrap:anywhere] text-sm font-bold text-[var(--text)]">{item.value}</dd></div>)}
        </dl>
      </SummarySection>

      <SummarySection title="2. 주요 결과">
        {summary.highlight ? <HighlightResult label={summary.highlight.label} value={summary.highlight.value} /> : null}
        {summary.results.length ? <ResultList results={summary.results} /> : null}
        {summary.lifecycleStages?.length ? <div className={summary.highlight ? "mt-4" : ""}><CarbonLifecycleChart stages={summary.lifecycleStages} /></div> : null}
      </SummarySection>

      <SummarySection title="3. 시험 기준 또는 검증 범위">
        {summary.environment.length ? <dl className="mb-4 flex flex-wrap gap-2">{summary.environment.map((item) => <div className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs" key={`${item.label}-${item.value}`}><dt className="inline font-bold text-[var(--sub-text)]">{item.label} </dt><dd className="inline font-bold text-[var(--text)]">{item.value}</dd></div>)}</dl> : null}
        <BulletList items={[...summary.testStandards, ...summary.verificationScope]} />
      </SummarySection>

      <SummarySection title="4. 주의사항"><BulletList items={summary.cautions} /></SummarySection>
    </div>
  );
}

function HighlightResult({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[var(--sub-sage)] bg-white/75 p-5"><p className="text-sm font-bold text-[var(--primary-dark)]">{label}</p><p className="number mt-2 [overflow-wrap:anywhere] text-3xl font-bold text-[var(--primary)]">{value}</p></div>;
}

function SummarySection({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className="min-w-0"><h4 className="mb-3 text-sm font-extrabold text-[var(--primary-dark)]">{title}</h4>{children}</section>;
}

function BulletList({ items }: { items: string[] }) {
  return <ul className="grid min-w-0 gap-2 text-sm leading-6 text-[var(--sub-text)]">{items.map((item) => <li className="flex min-w-0 gap-2" key={item}><span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-gold-dark)]" /><span className="min-w-0 [overflow-wrap:anywhere]">{item}</span></li>)}</ul>;
}

function ResultList({ results }: { results: KoreanDocumentSummary["results"] }) {
  return (
    <>
      <div className="hidden min-w-0 overflow-hidden rounded-lg border border-[var(--line)] bg-white sm:block">
        <table className="w-full table-fixed text-left text-xs">
          <thead className="bg-[var(--primary-dark)] text-white"><tr><th className="w-[34%] px-3 py-3">시험항목</th><th className="w-[22%] px-3 py-3">기준값</th><th className="w-[24%] px-3 py-3">시험값</th><th className="w-[20%] px-3 py-3">판정</th></tr></thead>
          <tbody>{results.map((result) => <tr className="border-t border-[var(--line)]" key={result.name}><th className="[overflow-wrap:anywhere] px-3 py-3 font-bold text-[var(--text)]">{result.name}</th><td className="[overflow-wrap:anywhere] px-3 py-3 text-[var(--sub-text)]">{result.standard}</td><td className="number [overflow-wrap:anywhere] px-3 py-3 font-bold text-[var(--primary)]">{result.value}</td><td className="px-3 py-3 font-bold text-[var(--primary)]">{result.judgement}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="grid min-w-0 gap-3 sm:hidden">
        {results.map((result) => <article className="min-w-0 rounded-lg border border-[var(--line)] bg-white p-3" key={result.name}><h5 className="[overflow-wrap:anywhere] text-sm font-bold">{result.name}</h5><dl className="mt-3 grid gap-2 text-xs"><div className="flex min-w-0 justify-between gap-3"><dt className="text-[var(--sub-text)]">기준값</dt><dd className="min-w-0 text-right [overflow-wrap:anywhere]">{result.standard}</dd></div><div className="flex min-w-0 justify-between gap-3"><dt className="text-[var(--sub-text)]">시험값</dt><dd className="number min-w-0 text-right font-bold text-[var(--primary)] [overflow-wrap:anywhere]">{result.value}</dd></div><div className="flex justify-between gap-3"><dt className="text-[var(--sub-text)]">판정</dt><dd className="font-bold text-[var(--primary)]">{result.judgement}</dd></div></dl></article>)}
      </div>
    </>
  );
}

function CarbonLifecycleChart({ stages }: { stages: LifecycleStage[] }) {
  const maxMagnitude = Math.max(0.1, ...stages.map((stage) => Math.abs(stage.value)));
  return (
    <div className="min-w-0 rounded-lg border border-[var(--line)] bg-white p-3 sm:p-4">
      <div className="grid min-w-0 gap-4">
        {stages.map((stage) => {
          const width = `${Math.max(2, (Math.abs(stage.value) / maxMagnitude) * 48)}%`;
          return <div className="min-w-0" key={stage.label}>
            <div className="mb-1.5 flex min-w-0 items-baseline justify-between gap-3 text-xs"><span className="min-w-0 font-bold [overflow-wrap:anywhere]">{stage.label}</span><span className="number shrink-0 font-bold text-[var(--primary-dark)]">{stage.value.toFixed(4)}kg CO₂e</span></div>
            <div className="relative h-5 overflow-hidden rounded-sm bg-[var(--muted-surface)]" role="img" aria-label={`${stage.label} ${stage.value.toFixed(4)}kg CO₂e`}>
              <span aria-hidden="true" className="absolute top-0 bottom-0 left-1/2 z-10 w-px bg-[var(--sub-text)]/55" />
              <span aria-hidden="true" className={`absolute top-1 bottom-1 rounded-sm ${stage.value < 0 ? "right-1/2 bg-[var(--accent-gold)]" : "left-1/2 bg-[var(--primary)]"}`} style={{ width }} />
            </div>
          </div>;
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--sub-text)]">폐기 단계의 음수값을 포함한 생애주기 단계별 합계입니다.</p>
    </div>
  );
}

function PdfPreviewModal({ item, onClose }: { item: DocumentItem; onClose: () => void }) {
  const source = item.previewUrl || item.fileUrl;
  const viewerSource = `${source}${source.includes("#") ? "&" : "#"}toolbar=0&navpanes=0&statusbar=0&view=FitH`;
  return (
    <div aria-label={`${item.title} 원문 미리보기`} aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
      <div className="flex h-[min(92dvh,900px)] w-full max-w-[1000px] min-w-0 flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
          <div className="min-w-0"><p className="truncate text-sm font-bold text-[var(--text)]">{item.title}</p><p className="mt-0.5 text-xs text-[var(--sub-text)]">원문 PDF 미리보기 · 다운로드 기능은 제공하지 않습니다.</p></div>
          <button aria-label="원문 미리보기 닫기" autoFocus className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--line)] text-xl text-[var(--text)]" onClick={onClose} type="button">×</button>
        </div>
        <iframe className="min-h-0 flex-1 border-0 bg-[var(--muted-surface)]" src={viewerSource} title={`${item.title} PDF 원문`} />
        <p className="border-t border-[var(--line)] px-4 py-2 text-[10px] leading-4 text-[var(--sub-text)]">브라우저 환경에 따라 기본 PDF 기능을 완전히 제한할 수는 없으며, 이 화면에서는 별도 다운로드·인쇄 UI를 제공하지 않습니다.</p>
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return <svg aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform duration-[240ms] ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
}
