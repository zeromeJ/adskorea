"use client";

import Link from "next/link";
import { ArrowRight, FileDown } from "lucide-react";
import { useState } from "react";
import { productBrochureDownloadPath } from "@/lib/downloads";
import { trackEvent } from "@/lib/trackEvent";

export default function CatalogDownload({
  location,
  compact = false,
}: {
  location: string;
  compact?: boolean;
}) {
  const [downloaded, setDownloaded] = useState(false);
  return (
    <div className="min-w-0">
      <a
        className={`inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--sub-sage)] bg-[var(--sub-mint)] px-5 font-extrabold text-[var(--primary-deep)] transition hover:bg-[#cfe0d2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
          compact ? "text-sm" : "w-full sm:w-auto"
        }`}
        download
        href={productBrochureDownloadPath}
        onClick={() => {
          setDownloaded(true);
          trackEvent("catalog_download", { location });
        }}
      >
        <FileDown aria-hidden="true" size={19} />
        제품 카탈로그 다운로드
      </a>
      {downloaded ? (
        <div
          aria-live="polite"
          className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-[var(--primary-dark)]"
        >
          <span>다음 검토 단계</span>
          <Link className="inline-flex items-center gap-1 underline" href="/products#comparison">
            제품 비교 <ArrowRight aria-hidden="true" size={14} />
          </Link>
          <Link className="inline-flex items-center gap-1 underline" href="/documents">
            시험자료 <ArrowRight aria-hidden="true" size={14} />
          </Link>
          <Link className="inline-flex items-center gap-1 underline" href="/#inquiry">
            견적 문의 <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
