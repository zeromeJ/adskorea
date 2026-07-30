"use client";

import {
  ChevronDown,
  Download,
  ExternalLink,
  FileSearch,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";

export type DocumentExplorerItem = {
  title: string;
  documentType: string;
  issuer: string;
  reportNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  relatedProducts?: string[];
  language: string;
  fileUrl?: string;
  previewUrl?: string;
  summary?: string;
  koreanSummary?: {
    overview?: Array<{ label: string; value: string }>;
    results?: Array<{
      name: string;
      value: string;
      standard?: string;
      judgement?: string;
    }>;
    cautions?: string[];
    highlight?: { label: string; value: string };
  };
};

const reviewFilters = [
  "전체",
  "품질 검토용",
  "환경 검토용",
  "구매 승인용",
];

function categoriesFor(document: DocumentExplorerItem) {
  const categories = ["구매 승인용"];
  if (document.documentType.includes("카탈로그")) categories.push("첫 검토용");
  if (
    document.documentType.includes("성능") ||
    document.documentType.includes("포름알데히드")
  ) {
    categories.push("품질 검토용");
  }
  if (document.documentType.includes("탄소")) categories.push("환경 검토용");
  return categories;
}

function documentInfoRows(document: DocumentExplorerItem) {
  const rows: Array<[string, string]> = [
    ["보고서 번호", document.reportNumber || "원문 참조"],
    ["원문 언어", document.language],
    ["유효기간", document.expiryDate || "원문 참조"],
    ...(document.koreanSummary?.overview || [])
      .slice(0, 4)
      .map((item): [string, string] => [item.label, item.value]),
  ];
  return rows.filter(
    ([label], index) =>
      rows.findIndex(([candidate]) => candidate === label) === index,
  );
}

export default function DocumentExplorer({
  documents,
}: {
  documents: DocumentExplorerItem[];
}) {
  const [filter, setFilter] = useState("전체");
  const [preview, setPreview] = useState<DocumentExplorerItem | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousTriggerRef = useRef<HTMLElement | null>(null);
  const closePreview = useCallback(() => {
    setPreview(null);
    requestAnimationFrame(() => previousTriggerRef.current?.focus());
  }, []);

  const filtered = useMemo(() => {
    return filter === "전체"
      ? documents
      : documents.filter((document) =>
          categoriesFor(document).includes(filter),
        );
  }, [documents, filter]);

  useEffect(() => {
    if (!preview) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
      if (event.key === "Tab") {
        const modal = document.getElementById("document-preview-dialog");
        const focusable = modal?.querySelectorAll<HTMLElement>(
          "button, a[href], iframe, [tabindex]:not([tabindex='-1'])",
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closePreview, preview]);

  function openPreview(
    document: DocumentExplorerItem,
    trigger: HTMLElement,
  ) {
    previousTriggerRef.current = trigger;
    setPreview(document);
    trackEvent("document_preview", {
      document_type: document.documentType,
    });
  }

  return (
    <>
      <div className="py-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="자료 분류">
          {reviewFilters.map((item) => (
            <button
              aria-pressed={filter === item}
              className={`min-h-12 border px-4 text-sm font-bold ${
                filter === item
                  ? "border-[var(--primary)] bg-[var(--primary-dark)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--sub-text)]"
              }`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p
        aria-live="polite"
        className="mt-6 text-sm font-bold text-[var(--sub-text)]"
      >
        {filtered.length}건의 자료
      </p>
      <div className="mt-4 grid gap-4">
        {filtered.map((document, index) => (
          <article
            className="border border-[var(--line)] bg-white"
            id={`document-${documents.indexOf(document) + 1}`}
            key={document.title}
          >
            <div className="grid gap-5 p-5 lg:grid-cols-[1.4fr_0.7fr_0.7fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-bold text-[var(--accent-gold-dark)]">
                  {document.documentType}
                </p>
                <h2 className="mt-2 text-lg font-extrabold">{document.title}</h2>
                <p className="mt-2 text-xs text-[var(--sub-text)]">
                  관련 제품{" "}
                  {document.relatedProducts?.join(", ") || "원문 참조"}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-xs text-[var(--sub-text)]">기관</p>
                <p className="mt-1 font-bold">{document.issuer}</p>
              </div>
              <div className="text-sm">
                <p className="text-xs text-[var(--sub-text)]">발급일</p>
                <p className="mt-1 font-bold">
                  {document.issueDate || "원문 참조"}
                </p>
              </div>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--primary)] px-4 text-sm font-extrabold text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!document.previewUrl && !document.fileUrl}
                onClick={(event) => openPreview(document, event.currentTarget)}
                type="button"
              >
                <FileSearch aria-hidden="true" size={17} />
                원문 미리보기
              </button>
            </div>
            <details
              className="group border-t border-[var(--line)]"
              onToggle={(event) => {
                if (event.currentTarget.open) {
                  trackEvent("document_summary_open", {
                    document_index: index + 1,
                  });
                }
              }}
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm font-extrabold text-[var(--primary-dark)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]">
                한국어 요약과 상세정보
                <ChevronDown
                  aria-hidden="true"
                  className="transition group-open:rotate-180"
                  size={18}
                />
              </summary>
              <div className="grid gap-6 border-t border-[var(--line)] bg-[var(--background)] p-5 lg:grid-cols-2">
                <div>
                  <h3 className="font-extrabold">문서 정보</h3>
                  <dl className="mt-4 grid gap-2 text-sm">
                    {documentInfoRows(document).map(([label, value]) => (
                      <div className="flex justify-between gap-4" key={label}>
                        <dt className="text-[var(--sub-text)]">{label}</dt>
                        <dd className="text-right font-bold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h3 className="font-extrabold">핵심 요약</h3>
                  {document.koreanSummary?.highlight ? (
                    <p className="number mt-4 text-2xl font-bold text-[var(--primary)]">
                      {document.koreanSummary.highlight.value}
                      <span className="ml-2 text-sm text-[var(--text)]">
                        {document.koreanSummary.highlight.label}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[var(--sub-text)]">
                      {document.summary ||
                        document.koreanSummary?.results
                          ?.slice(0, 3)
                          .map((result) => `${result.name} ${result.value}`)
                          .join(" · ") ||
                        "한국어 요약은 원문 이해를 돕기 위한 참고정보입니다."}
                    </p>
                  )}
                  <ul className="mt-4 text-xs leading-6 text-[var(--sub-text)]">
                    {(document.koreanSummary?.cautions || []).map((caution) => (
                      <li key={caution}>· {caution}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </article>
        ))}
      </div>

      {preview ? (
        <div
          aria-labelledby="document-preview-title"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(8,22,16,.72)] p-3 sm:p-6"
          id="document-preview-dialog"
          role="dialog"
        >
          <div className="flex h-[92dvh] w-full max-w-5xl flex-col bg-white">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--line)] px-4 sm:px-6">
              <h2
                className="line-clamp-2 min-w-0 font-extrabold"
                id="document-preview-title"
              >
                {preview.title}
              </h2>
              <button
                className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[var(--line)] px-3 font-bold"
                onClick={closePreview}
                ref={closeRef}
                type="button"
              >
                <X aria-hidden="true" size={18} />
                닫기
              </button>
            </div>
            <iframe
              className="min-h-0 flex-1 bg-[#e8e8e8]"
              src={preview.previewUrl || preview.fileUrl}
              title={`${preview.title} PDF 미리보기`}
            />
            <div className="border-t border-[var(--line)] p-4 text-xs leading-6 text-[var(--sub-text)] sm:px-6">
              <p>
                한국어 요약은 원문 이해를 돕기 위한 참고정보입니다. 공식 판단은
                원문 문서의 검증 범위와 제한조건을 기준으로 하십시오.
              </p>
              {preview.fileUrl ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    className="inline-flex min-h-11 items-center gap-2 border border-[var(--primary)] px-4 font-extrabold text-[var(--primary)]"
                    download
                    href={preview.fileUrl}
                  >
                    <Download aria-hidden="true" size={16} />
                    원문 다운로드
                  </a>
                  <a
                    className="inline-flex min-h-11 items-center gap-2 px-4 font-extrabold text-[var(--primary)]"
                    href={preview.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink aria-hidden="true" size={16} />
                    새 창에서 열기
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
