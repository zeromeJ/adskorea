"use client";

import Image from "next/image";
import {
  ChevronDown,
  ExternalLink,
  FileSearch,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CatalogApplicationCase,
  CatalogDocument,
  ModelSpecification,
} from "@/data/catalog/types";
import { rndQualityTabs } from "@/data/catalog/content";
import SourceBadge from "@/components/SourceBadge";

export function ModelSpecificationsExplorer({
  specifications,
}: {
  specifications: ModelSpecification[];
}) {
  const [series, setSeries] = useState("전체");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return specifications.filter((specification) => {
      const matchesSeries =
        series === "전체" || specification.series === series;
      const matchesQuery =
        !normalized ||
        specification.model.toLowerCase().includes(normalized) ||
        String(specification.length).includes(normalized) ||
        specification.width.includes(normalized);
      return matchesSeries && matchesQuery;
    });
  }, [query, series, specifications]);

  return (
    <div>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          aria-label="제품 계열 필터"
          className="no-scrollbar flex gap-2 overflow-x-auto"
          role="group"
        >
          {["전체", "AD", "AC", "AS"].map((item) => (
            <button
              aria-pressed={series === item}
              className={`min-h-12 shrink-0 border px-5 text-base font-extrabold ${
                series === item
                  ? "border-[var(--primary)] bg-[var(--primary-dark)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--sub-text)]"
              }`}
              key={item}
              onClick={() => setSeries(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:max-w-sm" htmlFor="model-search">
          <span className="sr-only">모델명, 길이 또는 너비 검색</span>
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--sub-text)]"
            size={20}
          />
          <input
            className="min-h-12 w-full border border-[var(--line)] bg-white pr-4 pl-12 text-base focus:border-[var(--primary)] focus:outline-none"
            id="model-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="모델명·길이·너비 검색"
            type="search"
            value={query}
          />
        </label>
      </div>

      <p aria-live="polite" className="mt-5 text-base font-bold text-[var(--sub-text)]">
        {filtered.length}개 모델
      </p>

      <div className="mt-4 grid gap-4 lg:hidden">
        {filtered.map((specification) => (
          <details
            className="group border border-[var(--line)] bg-white"
            key={specification.id}
          >
            <summary className="flex min-h-24 cursor-pointer list-none items-center justify-between gap-4 p-5">
              <span>
                <span className="text-sm font-bold text-[var(--accent-gold-dark)]">
                  {specification.series} · {specification.type}
                </span>
                <strong className="mt-2 block break-all text-xl text-[var(--primary-dark)]">
                  {specification.model}
                </strong>
                <span className="mt-2 block text-sm font-bold">
                  동 {specification.dynamicLoad.toLocaleString()}kg · 정 {specification.staticLoad.toLocaleString()}kg
                </span>
              </span>
              <ChevronDown aria-hidden="true" className="shrink-0 group-open:rotate-180" />
            </summary>
            <dl className="grid grid-cols-2 gap-px border-t border-[var(--line)] bg-[var(--line)] text-base">
              {[
                ["길이", `${specification.length}mm`],
                ["너비", `${specification.width}mm`],
                ["높이", `${specification.height}mm`],
                ["포크 진입 높이", `${specification.forkClearance}mm`],
              ].map(([label, value]) => (
                <div className="bg-[var(--background)] p-4" key={label}>
                  <dt className="text-sm text-[var(--sub-text)]">{label}</dt>
                  <dd className="number mt-1 font-bold">{value}</dd>
                </div>
              ))}
            </dl>
            {specification.confirmationRequired ? (
              <p className="border-t border-[var(--line)] p-4 text-sm font-bold text-[var(--alert)]">
                원문 모델명 표기 사용자 확인 필요
              </p>
            ) : null}
          </details>
        ))}
      </div>

      <div className="mt-4 hidden max-h-[720px] overflow-auto border-y border-[var(--catalog-line)] bg-white lg:block">
        <table className="w-full min-w-[1180px] border-collapse text-left text-[17px]">
          <thead className="sticky top-0 z-20 bg-[var(--catalog-green-dark)] text-white">
            <tr>
              {["계열", "모델명", "길이", "너비", "높이", "포크 진입 높이", "제조사 제시 동하중", "제조사 제시 정하중"].map((label) => (
                <th className="px-5 py-5 font-extrabold" key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((specification, index) => (
              <tr
                className={`group border-t border-[var(--catalog-line)] transition-colors hover:bg-[var(--catalog-soft-green)] ${index % 2 ? "bg-[var(--catalog-cream)]" : "bg-white"}`}
                key={specification.id}
              >
                <td className={`sticky left-0 z-10 border-l-4 bg-inherit px-5 py-5 font-extrabold text-[var(--catalog-green)] ${specification.series === "AD" ? "border-[var(--catalog-green)]" : specification.series === "AC" ? "border-[var(--catalog-gold)]" : "border-[var(--catalog-muted)]"}`}>{specification.series}</td>
                <td className="sticky left-[78px] z-10 bg-inherit px-5 py-5 font-extrabold shadow-[1px_0_var(--catalog-line)]">
                  {specification.model}
                  {specification.confirmationRequired ? <span className="ml-2 text-xs text-[var(--alert)]">확인 필요</span> : null}
                </td>
                <td className="number px-5 py-5">{specification.length}mm</td>
                <td className="number px-5 py-5">{specification.width}mm</td>
                <td className="number px-5 py-5">{specification.height}mm</td>
                <td className="number px-5 py-5">{specification.forkClearance}mm</td>
                <td className="number px-5 py-5 font-bold">{specification.dynamicLoad.toLocaleString()}kg</td>
                <td className="number px-5 py-5 font-bold">{specification.staticLoad.toLocaleString()}kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const applicationFilters = [
  "전체",
  "톤백·포대",
  "드럼·용기",
  "박스",
  "산업부품",
  "창고·랙",
  "운송",
] as const;

export function CatalogApplicationExplorer({
  cases,
}: {
  cases: CatalogApplicationCase[];
}) {
  const [filter, setFilter] = useState<(typeof applicationFilters)[number]>("전체");
  const [expanded, setExpanded] = useState(false);
  const approved = cases.filter(
    (item) => item.publicApproved && item.visible && item.imageUrl,
  );
  const filtered = approved.filter(
    (item) => filter === "전체" || item.category === filter,
  );
  const visible = expanded ? filtered : filtered.slice(0, 6);

  return (
    <div>
      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto" role="group" aria-label="적용 사례 필터">
        {applicationFilters.map((item) => (
          <button
            aria-pressed={filter === item}
            className={`min-h-12 shrink-0 border px-4 text-base font-bold ${filter === item ? "border-[var(--primary)] bg-[var(--primary-dark)] text-white" : "border-[var(--line)] bg-white"}`}
            key={item}
            onClick={() => { setFilter(item); setExpanded(false); }}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      {!visible.length ? (
        <div className="mt-6 border border-dashed border-[var(--sub-sage)] bg-[var(--muted-surface)] p-8 text-base leading-8 text-[var(--sub-text)]">
          현재 공개 중인 적용 사례가 없습니다.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
          {visible.map((item, index) => (
            <article className={`group overflow-hidden border border-[var(--catalog-line)] bg-white ${index === 0 ? "md:col-span-2 lg:col-span-8" : index === 1 ? "lg:col-span-4" : "lg:col-span-6"}`} data-catalog-reveal key={item.id}>
              <div className={`relative overflow-hidden bg-[var(--muted-surface)] ${index === 0 ? "aspect-video" : index % 3 === 1 ? "aspect-[4/5] lg:aspect-[4/3]" : "aspect-square lg:aspect-[4/3]"}`}>
                <Image alt={item.imageAlt} className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]" fill sizes={index === 0 ? "(max-width: 1023px) 100vw, 66vw" : "(max-width: 767px) 100vw, 50vw"} src={item.imageUrl!} />
              </div>
              <div className="p-5 transition-transform duration-500 group-hover:-translate-y-1 lg:p-7">
                <SourceBadge kind="application" />
                <h3 className="mt-2 text-xl font-extrabold">{item.title}</h3>
                <dl className="mt-4 grid gap-3 border-t border-[var(--line)] pt-4 text-base">
                  <div className="flex justify-between gap-4"><dt className="text-[var(--sub-text)]">화물</dt><dd className="text-right font-bold">{item.cargoType || "자료 확인 필요"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[var(--sub-text)]">환경</dt><dd className="text-right font-bold">{item.environment || "자료 확인 필요"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[var(--sub-text)]">문서 기재 중량</dt><dd className="text-right font-bold">{item.weightText || "중량 미기재"}</dd></div>
                  {item.companyNameVisible && item.companyName ? <div className="flex justify-between gap-4"><dt className="text-[var(--sub-text)]">고객사</dt><dd className="text-right font-bold">{item.companyName}</dd></div> : null}
                </dl>
              </div>
            </article>
          ))}
        </div>
      )}
      {filtered.length > 6 ? (
        <button className="mx-auto mt-8 flex min-h-12 items-center border border-[var(--primary)] px-6 font-extrabold text-[var(--primary)]" onClick={() => setExpanded((value) => !value)} type="button">
          {expanded ? "접기" : `더보기 (${filtered.length - 6})`}
        </button>
      ) : null}
    </div>
  );
}

const documentFilters = ["전체", "물리성능", "포름알데히드", "탄소발자국", "기술 적합성", "FSC", "수출·등록"] as const;

export function CatalogDocumentLibrary({ documents }: { documents: CatalogDocument[] }) {
  const [filter, setFilter] = useState<(typeof documentFilters)[number]>("전체");
  const [query, setQuery] = useState("");
  const [featuredId, setFeaturedId] = useState(documents[0]?.id || "");
  const [selected, setSelected] = useState<CatalogDocument | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousTriggerRef = useRef<HTMLElement | null>(null);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return documents.filter((document) =>
      document.visible &&
      (filter === "전체" || document.category === filter) &&
      (!normalized || `${document.title} ${document.issuer} ${document.documentNumber}`.toLowerCase().includes(normalized)),
    );
  }, [documents, filter, query]);
  const featured = filtered.find((document) => document.id === featuredId) || filtered[0];

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key !== "Tab") return;
      const dialog = document.getElementById("catalog-document-dialog");
      const focusable = dialog?.querySelectorAll<HTMLElement>("button, a[href], iframe, [tabindex]:not([tabindex='-1'])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousTriggerRef.current?.focus();
    };
  }, [selected]);

  function requestDocument() {
    window.dispatchEvent(new CustomEvent("adson:inquiry-prefill", { detail: { inquiryType: "technical" } }));
  }

  function documentAction(document: CatalogDocument) {
    if (document.publicDownload && document.pdfUrl) {
      return (
        <button className="inline-flex min-h-12 items-center gap-2 border border-[var(--catalog-green)] px-5 font-extrabold text-[var(--catalog-green)]" onClick={(event) => { previousTriggerRef.current = event.currentTarget; setSelected(document); }} type="button"><FileSearch aria-hidden="true" size={18} />원문 보기</button>
      );
    }
    return <a className="inline-flex min-h-12 items-center gap-2 bg-[var(--catalog-green)] px-5 font-extrabold text-white" href="#contact" onClick={requestDocument}>자료 확인 문의</a>;
  }

  return (
    <div>
      <div className="mt-10 flex flex-col gap-4 border-y border-[var(--catalog-line)] py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto" role="group" aria-label="문서 카테고리">
          {documentFilters.map((item) => (
            <button aria-pressed={filter === item} className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-bold ${filter === item ? "border-[var(--catalog-green)] text-[var(--catalog-green)]" : "border-transparent text-[var(--catalog-muted)] hover:border-[var(--catalog-line)]"}`} key={item} onClick={() => setFilter(item)} type="button">{item}</button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <p aria-live="polite" className="number shrink-0 text-sm font-bold text-[var(--catalog-muted)]">{filtered.length} DOCUMENTS</p>
          <label className="relative block w-full lg:w-72" htmlFor="document-search"><span className="sr-only">문서명, 기관 또는 문서번호 검색</span><Search aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--catalog-muted)]" size={18} /><input className="min-h-11 w-full border border-[var(--catalog-line)] bg-white pr-3 pl-10 text-sm outline-none focus:border-[var(--catalog-green)]" id="document-search" onChange={(event) => setQuery(event.target.value)} placeholder="문서명·기관·번호 검색" type="search" value={query} /></label>
        </div>
      </div>
      {featured ? <article className="mt-10 grid gap-8 bg-[var(--catalog-warm-gray)] p-6 lg:grid-cols-[0.42fr_0.58fr] lg:p-10" data-catalog-reveal><div className="relative flex min-h-80 items-center justify-center bg-white shadow-[0_18px_40px_rgba(37,42,39,.08)]">{featured.thumbnailUrl ? <Image alt={`${featured.title} 문서 썸네일`} className="object-contain p-5" fill sizes="(max-width: 1023px) 100vw, 42vw" src={featured.thumbnailUrl} /> : <div className="text-center"><FileSearch aria-hidden="true" className="mx-auto text-[var(--catalog-green)]" size={42} /><p className="mt-4 text-sm font-bold text-[var(--catalog-muted)]">문서 썸네일 입력 예정</p><p className="number mt-3 text-xs font-bold text-[var(--catalog-green)]">{featured.documentNumber}</p></div>}</div><div className="flex flex-col"><div className="flex flex-wrap items-center justify-between gap-3"><SourceBadge kind={featured.sourceType === "SGS_VERIFICATION" ? "sgs" : featured.sourceType === "THIRD_PARTY_TEST" ? "third-party" : "official"} /><span className="text-sm font-bold text-[var(--catalog-muted)]">{featured.category}</span></div><h3 className="mt-6 text-3xl font-extrabold leading-tight text-[var(--catalog-green-dark)]">{featured.title}</h3><p className="mt-4 text-base leading-7 text-[var(--catalog-muted)]">{featured.summary}</p>{featured.keyResult ? <p className="number mt-6 text-3xl font-bold text-[var(--catalog-green)]">{featured.keyResult}</p> : null}<dl className="mt-7 grid gap-4 border-t border-[var(--catalog-line)] pt-6 text-base sm:grid-cols-2"><div><dt className="text-xs font-bold text-[var(--catalog-muted)]">기관</dt><dd className="mt-1 font-bold">{featured.issuer}</dd></div><div><dt className="text-xs font-bold text-[var(--catalog-muted)]">문서번호</dt><dd className="number mt-1 break-all font-bold">{featured.documentNumber}</dd></div>{featured.issueDate ? <div><dt className="text-xs font-bold text-[var(--catalog-muted)]">발급·등록일</dt><dd className="mt-1 font-bold">{featured.issueDate}</dd></div> : null}{featured.expiryDate ? <div><dt className="text-xs font-bold text-[var(--catalog-muted)]">유효기간</dt><dd className="mt-1 font-bold">{featured.expiryDate}</dd></div> : null}<div className="sm:col-span-2"><dt className="text-xs font-bold text-[var(--catalog-muted)]">관련 제품·범위</dt><dd className="mt-1 font-bold">{featured.relatedProduct}</dd></div></dl><ul className="mt-5 flex flex-wrap gap-2" aria-label="문서 확인 범위">{featured.scope.map((item) => <li className="border border-[var(--catalog-line)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--catalog-muted)]" key={item}>{item}</li>)}</ul><ul className="mt-5 border-l-2 border-[var(--catalog-gold)] pl-4 text-sm leading-6 text-[var(--catalog-muted)]">{featured.caution.map((caution) => <li key={caution}>· {caution}</li>)}</ul><div className="mt-auto pt-7">{documentAction(featured)}</div></div></article> : <p className="mt-8 border border-dashed border-[var(--catalog-line)] p-8 text-[var(--catalog-muted)]">검색 조건에 맞는 문서가 없습니다.</p>}

      <div className="mt-12 border-t border-[var(--catalog-line)]">
        {filtered.map((document) => <article className={`grid gap-4 border-b border-[var(--catalog-line)] py-6 transition-colors hover:bg-[var(--catalog-soft-green)] md:grid-cols-[150px_1fr_180px_auto] md:items-center md:px-4 ${featured?.id === document.id ? "bg-[var(--catalog-soft-green)]" : ""}`} key={document.id}><span className="text-sm font-bold text-[var(--catalog-green)]">{document.category}</span><button className="text-left" onClick={() => setFeaturedId(document.id)} type="button"><strong className="block text-lg text-[var(--catalog-green-dark)]">{document.title}</strong><span className="mt-1 block text-sm text-[var(--catalog-muted)]">{document.issuer}</span></button><div className="text-sm text-[var(--catalog-muted)]"><p>{document.issueDate || "발급일 미기재"}</p>{document.expiryDate ? <p className="mt-1">유효 {document.expiryDate}</p> : null}</div><div>{documentAction(document)}</div></article>)}
      </div>
      {selected?.pdfUrl ? (
        <div aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,22,16,.76)] p-4" id="catalog-document-dialog" role="dialog">
          <div className="flex h-[92dvh] w-full max-w-5xl flex-col bg-white">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--line)] px-5">
              <h3 className="min-w-0 font-extrabold">{selected.title}</h3>
              <button className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[var(--line)] px-4 font-bold" onClick={() => setSelected(null)} ref={closeRef} type="button"><X aria-hidden="true" size={18} />닫기</button>
            </div>
            <iframe className="min-h-0 flex-1 bg-[var(--catalog-warm-gray)]" src={selected.pdfUrl} title={`${selected.title} 원문`} />
            <div className="border-t border-[var(--line)] p-4"><a className="inline-flex min-h-11 items-center gap-2 font-extrabold text-[var(--primary)]" href={selected.pdfUrl} rel="noreferrer" target="_blank"><ExternalLink aria-hidden="true" size={17} />새 탭에서 보기</a></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function RndQualityTabs() {
  const [selected, setSelected] = useState<string>(rndQualityTabs[0].id);
  const current = rndQualityTabs.find((item) => item.id === selected) || rndQualityTabs[0];
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-y border-[var(--catalog-line)] lg:grid lg:content-start lg:overflow-visible" role="tablist" aria-label="R&D와 품질관리">
        {rndQualityTabs.map((tab) => (
          <button aria-controls={`rnd-panel-${tab.id}`} aria-selected={selected === tab.id} className={`grid min-h-20 shrink-0 grid-cols-[38px_1fr] items-center gap-3 border-b border-[var(--catalog-line)] px-4 text-left text-base font-extrabold transition-colors ${selected === tab.id ? "bg-[var(--catalog-green-dark)] text-white" : "bg-transparent text-[var(--catalog-green-dark)] hover:bg-white/70"}`} id={`rnd-tab-${tab.id}`} key={tab.id} onClick={() => setSelected(tab.id)} role="tab" type="button"><span className={`number text-sm ${selected === tab.id ? "text-[var(--catalog-gold)]" : "text-[var(--catalog-muted)]"}`}>{String(rndQualityTabs.findIndex((item) => item.id === tab.id) + 1).padStart(2, "0")}</span>{tab.title}</button>
        ))}
      </div>
      <div aria-labelledby={`rnd-tab-${current.id}`} className="relative min-h-[420px] overflow-hidden border border-[var(--catalog-line)] bg-white p-7 lg:p-12" id={`rnd-panel-${current.id}`} role="tabpanel">
        <span aria-hidden="true" className="number absolute top-3 right-5 text-[clamp(7rem,14vw,12rem)] font-bold leading-none text-[var(--catalog-green)]/[0.05]">{String(rndQualityTabs.findIndex((item) => item.id === current.id) + 1).padStart(2, "0")}</span>
        <p className="en relative text-xs font-bold tracking-[0.2em] text-[var(--catalog-green)]">R&amp;D / QUALITY SYSTEM</p>
        <h3 className="relative mt-5 text-3xl font-extrabold text-[var(--catalog-green-dark)]">{current.title}</h3>
        <ul className="relative mt-10 grid gap-4 border-t border-[var(--catalog-line)] pt-7 text-lg leading-8 sm:grid-cols-2">
          {current.items.map((item) => <li className="flex gap-3" key={item}><span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-gold)]" />{item}</li>)}
        </ul>
      </div>
    </div>
  );
}
