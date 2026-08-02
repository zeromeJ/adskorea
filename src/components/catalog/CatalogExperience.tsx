"use client";

import { useEffect, useState } from "react";

const chapters = [
  { id: "product-overview", number: "01", label: "PRODUCT" },
  { id: "comparison", number: "02", label: "COMPARISON" },
  { id: "structure", number: "03", label: "STRUCTURE" },
  { id: "test-2025", number: "04", label: "VERIFIED" },
  { id: "lineup", number: "05", label: "LINEUP" },
  { id: "applications", number: "06", label: "CASES" },
  { id: "company", number: "07", label: "COMPANY" },
] as const;

export default function CatalogExperience() {
  const [active, setActive] = useState<string>(chapters[0].id);

  useEffect(() => {
    document.documentElement.classList.add("catalog-motion-ready");
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-catalog-reveal]"),
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10%", threshold: 0.08 },
    );
    revealElements.forEach((element) => revealObserver.observe(element));

    const chapterElements = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((element): element is HTMLElement => Boolean(element));
    const chapterObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              Math.abs(left.boundingClientRect.top) -
              Math.abs(right.boundingClientRect.top),
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-24% 0px -64%", threshold: 0 },
    );
    chapterElements.forEach((element) => chapterObserver.observe(element));

    return () => {
      revealObserver.disconnect();
      chapterObserver.disconnect();
      document.documentElement.classList.remove("catalog-motion-ready");
    };
  }, []);

  return (
    <aside
      aria-label="카탈로그 챕터 인덱스"
      className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 2xl:block"
    >
      <ol className="grid gap-1 border-r border-[var(--catalog-line)] pr-4">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <a
              aria-current={active === chapter.id ? "location" : undefined}
              className={`group flex min-h-8 items-center justify-end gap-2 text-[11px] font-bold tracking-[0.12em] transition-colors ${
                active === chapter.id
                  ? "text-[var(--catalog-gold)]"
                  : "text-[var(--catalog-muted)] opacity-45 hover:opacity-100"
              }`}
              href={`#${chapter.id}`}
            >
              <span className="en">{chapter.label}</span>
              <span className="number w-5 text-right">{chapter.number}</span>
              <span
                aria-hidden="true"
                className={`absolute right-[-21px] h-px bg-current transition-[width] ${
                  active === chapter.id ? "w-4" : "w-0 group-hover:w-2"
                }`}
              />
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
