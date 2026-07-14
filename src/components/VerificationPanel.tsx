"use client";

import { useState } from "react";

export type TestResult = {
  name: string;
  value: string;
  referenceValue?: string;
  judgement?: string;
  note?: string;
};

export type TestGroup = {
  id: string;
  label: string;
  organization: string;
  classification: string;
  documentType?: string;
  reportNumber: string;
  issueDate?: string;
  testDate: string;
  specimen: string;
  results: TestResult[];
  reportFileUrl?: string;
  relatedVideoIds?: string[];
  notices?: string[];
};

export default function VerificationPanel({ groups }: { groups: TestGroup[] }) {
  const [activeId, setActiveId] = useState(groups[0]?.id ?? "");
  const activeGroup = groups.find((group) => group.id === activeId) ?? groups[0];

  if (!activeGroup) return null;

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-2 min-[341px]:grid-cols-2" role="tablist">
        {groups.map((group) => {
          const selected = group.id === activeGroup.id;
          return (
            <button
              aria-controls={`panel-${group.id}`}
              aria-selected={selected}
              className={`flex min-h-14 w-full min-w-0 items-center justify-center rounded-md border px-3 py-2 text-center text-sm leading-5 font-bold transition ${
                selected
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--text)] hover:border-[var(--primary)]"
              }`}
              id={`tab-${group.id}`}
              key={group.id}
              onClick={() => setActiveId(group.id)}
              role="tab"
              type="button"
            >
              {group.label}
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`tab-${activeGroup.id}`}
        className="mt-4"
        id={`panel-${activeGroup.id}`}
        role="tabpanel"
      >
        <h3 className="[overflow-wrap:anywhere] text-lg leading-7 font-bold text-[var(--text)]">
          {activeGroup.label}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[var(--sub-mint)] px-3 py-1.5 font-bold text-[var(--primary-dark)]">
            {activeGroup.classification}
          </span>
        </div>

        <dl className="mt-3 grid min-w-0 gap-2 rounded-lg border border-[var(--line)] bg-white p-4 text-sm min-[520px]:grid-cols-2">
          <div className="min-w-0"><dt className="text-xs font-bold text-[var(--sub-text)]">시험기관</dt><dd className="mt-1 [overflow-wrap:anywhere] font-bold text-[var(--text)]">{activeGroup.organization}</dd></div>
          <div className="min-w-0"><dt className="text-xs font-bold text-[var(--sub-text)]">시험기간</dt><dd className="mt-1 [overflow-wrap:anywhere] font-bold text-[var(--text)]">{activeGroup.testDate}</dd></div>
        </dl>

        <div className="mt-4 grid grid-cols-1 gap-3 min-[341px]:grid-cols-2 md:grid-cols-3">
          {activeGroup.results.map((result) => (
            <article
              className="flex w-full min-w-0 max-w-full flex-col rounded-lg border border-[var(--line)] bg-white p-3 sm:p-4"
              key={result.name}
            >
              <p className="flex min-h-10 items-center [overflow-wrap:anywhere] text-sm leading-5 font-bold text-[var(--text)]">
                {result.name}
              </p>
              <p className="number mt-1 whitespace-nowrap text-xl font-bold text-[var(--primary)] sm:text-2xl">
                {result.value}
              </p>
              <dl className="mt-2 grid gap-1 border-t border-[var(--line)] pt-2 text-xs leading-5 text-[var(--sub-text)]">
                <div className="flex min-w-0 justify-between gap-2">
                  <dt>기준값</dt>
                  <dd className="min-w-0 text-right [overflow-wrap:anywhere]">{result.referenceValue}</dd>
                </div>
                <div className="flex min-w-0 justify-between gap-2">
                  <dt>판정</dt>
                  <dd className="text-right font-bold text-[var(--primary)]">{result.judgement}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <details className="mt-4 min-w-0 overflow-clip rounded-lg border border-[var(--line)] bg-white text-sm leading-6 text-[var(--sub-text)]">
          <summary className="flex min-h-12 cursor-pointer items-center px-4 font-bold text-[var(--text)]">시험 상세 및 유의사항</summary>
          <div className="min-w-0 border-t border-[var(--line)] p-4 [overflow-wrap:anywhere]">
            {activeGroup.documentType ? <p>자료 구분: {activeGroup.documentType}</p> : null}
            <p>보고서 번호: {activeGroup.reportNumber}</p>
            {activeGroup.issueDate ? <p>발급일: {activeGroup.issueDate}</p> : null}
            <p>시험기간: {activeGroup.testDate}</p>
            <p>적용 시료: {activeGroup.specimen}</p>
            {activeGroup.notices?.length ? <ul className="mt-3 grid gap-1 text-xs">{activeGroup.notices.map((notice) => <li key={notice}>• {notice}</li>)}</ul> : null}
            {activeGroup.reportFileUrl || activeGroup.relatedVideoIds?.length ? <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeGroup.reportFileUrl ? (
              <a
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--text)]"
                href={activeGroup.reportFileUrl}
                rel="noreferrer"
                target="_blank"
              >
                PDF 보기
              </a>
            ) : null}
            {activeGroup.relatedVideoIds?.length ? <a className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--text)]" href="#performance-videos">관련 영상 보기</a> : null}
            </div> : null}
          </div>
        </details>
      </div>
    </div>
  );
}
