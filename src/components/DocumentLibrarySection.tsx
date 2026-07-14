"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import SectionTitle from "@/components/ui/SectionTitle";
import { documents as fallbackDocuments } from "@/lib/constants";

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
  publicDownload?: boolean;
  publicPreview?: boolean;
  previewAvailable?: boolean;
  summary?: string;
  thumbnailUrl?: string;
};

export default function DocumentLibrarySection({
  items = fallbackDocuments,
}: {
  items?: DocumentItem[];
}) {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
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

  function scrollFilters(direction: -1 | 1) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    filterRef.current?.scrollBy({ left: direction * 280, behavior: reduceMotion ? "auto" : "smooth" });
  }
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    return visibleItems.filter((item) => {
      const matchesCategory =
        category === "전체" || item.documentType === category;
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
    <section
      id="documents"
      className="bg-[var(--background)] px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]"
    >
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
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  event.preventDefault();
                  const buttons = Array.from(
                    filterRef.current?.querySelectorAll<HTMLButtonElement>("[data-filter-category]") ?? [],
                  );
                  const activeIndex = Math.max(0, buttons.findIndex((button) => button.dataset.filterCategory === category));
                  const nextIndex = Math.min(
                    buttons.length - 1,
                    Math.max(0, activeIndex + (event.key === "ArrowLeft" ? -1 : 1)),
                  );
                  const nextButton = buttons[nextIndex];
                  if (nextButton?.dataset.filterCategory) {
                    setCategory(nextButton.dataset.filterCategory);
                    nextButton.focus();
                  }
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filteredItems.map((item, index) => (
            <article
              className="relative grid min-w-0 grid-cols-[104px_minmax(0,1fr)] items-stretch gap-5 overflow-hidden rounded-lg border border-[var(--line)] bg-white p-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6"
              key={item.title}
            >
              <MediaPlaceholder
                alt={`${item.title} 문서 표지`}
                className="self-center"
                desktopRatio="9:16"
                fieldName={`downloadDocument.${index}.thumbnail`}
                guide="공개 문서 A4 표지"
                label="문서 썸네일"
                mediaType="document"
                mobileRatio="9:16"
                src={item.thumbnailUrl}
              />
              {item.fileUrl ? (
                <a
                  aria-label={`${item.title} PDF 다운로드`}
                  className="absolute top-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-md bg-black/[0.055] text-[var(--sub-text)] transition-colors hover:bg-black/[0.1] hover:text-[var(--primary-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                  download={`${item.title}.pdf`}
                  href={item.fileUrl}
                  title="PDF 다운로드"
                >
                  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </a>
              ) : null}
              <div className={`flex h-full min-w-0 flex-col ${item.fileUrl ? "pr-12" : ""}`}>
                <span className="w-fit rounded-md bg-[var(--sub-mint)] px-2.5 py-1 text-[10px] font-bold text-[var(--primary-dark)]">
                  {item.documentType}
                </span>
                <h3 className="mt-1.5 [overflow-wrap:anywhere] leading-6 font-bold text-[var(--text)]">
                  {item.title}
                </h3>
                {item.summary ? (
                  <p className="mt-1.5 text-xs leading-5 text-[var(--primary)]">
                    {item.summary}
                  </p>
                ) : null}
                <dl className="mt-2 grid gap-1 text-xs leading-5 text-[var(--sub-text)] [&>div]:[overflow-wrap:anywhere]">
                  <div>발급기관: {item.issuer}</div>
                  {item.reportNumber ? <div>문서번호: {item.reportNumber}</div> : null}
                  {item.issueDate ? <div>발급일: {item.issueDate}</div> : null}
                  {item.expiryDate ? <div>유효기간: {item.expiryDate}</div> : null}
                  {item.relatedProducts ? <div>적용 제품: {item.relatedProducts}</div> : null}
                  {item.language ? <div>언어: {item.language}</div> : null}
                </dl>
                {item.previewUrl ? (
                  <div className="mt-auto flex justify-end pt-4">
                    <a
                      className="rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--text)]"
                      href={item.previewUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      미리보기
                    </a>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        {filteredItems.length === 0 ? (
          <p className="mt-6 rounded-lg border border-[var(--line)] bg-white p-5 text-sm text-[var(--sub-text)]">
            조건에 맞는 공개 문서가 없습니다.
          </p>
        ) : null}
      </div>
    </section>
  );
}
