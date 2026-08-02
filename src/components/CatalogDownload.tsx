"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { trackEvent } from "@/lib/trackEvent";

export default function CatalogDownload({
  location,
  compact = false,
}: {
  location: string;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Link
        className={`inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--sub-sage)] bg-[var(--sub-mint)] px-5 font-extrabold text-[var(--primary-deep)] transition hover:bg-[#cfe0d2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
          compact ? "text-sm" : "w-full sm:w-auto"
        }`}
        href="/catalog"
        onClick={() => {
          trackEvent("catalog_view", { location });
        }}
      >
        <BookOpen aria-hidden="true" size={19} />
        웹 카탈로그 보기
      </Link>
    </div>
  );
}
