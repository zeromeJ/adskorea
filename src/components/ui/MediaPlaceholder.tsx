"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type MediaPlaceholderProps = {
  label: string;
  desktopRatio: string;
  mobileRatio?: string;
  guide: string;
  fieldName: string;
  mediaType?: "image" | "video" | "document";
  required?: boolean;
  src?: string;
  desktopSrc?: string;
  mobileSrc?: string;
  poster?: string;
  embedUrl?: string;
  alt?: string;
  hideWhenEmptyInProduction?: boolean;
  className?: string;
  desktopFill?: boolean;
  fillContainer?: boolean;
  expandable?: boolean;
  emptyLabel?: string;
};

function ratioValue(value: string) {
  const [width, height] = value.split(":");
  return `${width} / ${height}`;
}

export default function MediaPlaceholder({
  label,
  desktopRatio,
  mobileRatio = desktopRatio,
  guide,
  fieldName,
  mediaType = "image",
  required = false,
  src,
  desktopSrc,
  mobileSrc,
  poster,
  embedUrl,
  alt = "",
  hideWhenEmptyInProduction = false,
  className = "",
  desktopFill = false,
  fillContainer = false,
  expandable = true,
  emptyLabel,
}: MediaPlaceholderProps) {
  const [expandedSrc, setExpandedSrc] = useState("");
  const [failedSources, setFailedSources] = useState<Set<string>>(new Set());
  const desktopCandidate = desktopSrc ?? src;
  const mobileCandidate = mobileSrc ?? src;
  const resolvedDesktopSrc = desktopCandidate && !failedSources.has(desktopCandidate) ? desktopCandidate : undefined;
  const resolvedMobileSrc = mobileCandidate && !failedSources.has(mobileCandidate) ? mobileCandidate : undefined;

  useEffect(() => {
    if (!expandedSrc) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedSrc("");
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [expandedSrc]);

  if (
    !resolvedDesktopSrc &&
    !resolvedMobileSrc &&
    !embedUrl &&
    hideWhenEmptyInProduction &&
    process.env.NODE_ENV === "production"
  ) {
    return null;
  }

  function renderContent(
    ratio: string,
    responsiveClass: string,
    mediaSrc?: string,
    fill = false,
  ) {
    const hasMedia = Boolean(mediaSrc || embedUrl);

    return (
      <div
        className={`relative overflow-hidden rounded-lg border ${fill ? "h-full min-h-0" : ""} ${
          hasMedia
            ? "border-[var(--line)] bg-[var(--muted-surface)]"
            : "border-dashed border-[var(--sub-sage)] bg-[var(--muted-surface)]"
        } ${responsiveClass}`}
        style={fill ? undefined : { aspectRatio: ratioValue(ratio) }}
      >
        {mediaSrc && (mediaType === "image" || mediaType === "document") ? (
          <Image
            alt={alt}
            className="object-contain"
            fill
            onError={() => setFailedSources((current) => new Set(current).add(mediaSrc))}
            sizes="(max-width: 767px) 100vw, 50vw"
            src={mediaSrc}
            unoptimized={mediaSrc.startsWith("http")}
          />
        ) : null}
        {mediaSrc && mediaType === "video" && !embedUrl ? (
          <video
            className="h-full w-full bg-black object-contain"
            controls
            playsInline
            poster={poster}
            preload="metadata"
            src={mediaSrc}
          />
        ) : null}
        {embedUrl && mediaType === "video" ? (
          <iframe
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0 bg-black"
            src={embedUrl}
            title={label}
          />
        ) : null}
        {mediaSrc && mediaType !== "video" && expandable ? (
          <button
            aria-label={`${label} 크게 보기`}
            className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
            onClick={() => setExpandedSrc(mediaSrc)}
            type="button"
          >
            <span className="sr-only">{label} 크게 보기</span>
            <span className="pointer-events-none absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-md border border-white/70 bg-black/45 text-white shadow-sm backdrop-blur-[2px]" aria-hidden="true">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20">
                <path d="M7 3H3v4M13 3h4v4M7 17H3v-4M13 17h4v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </span>
          </button>
        ) : null}
        {!hasMedia ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
            {emptyLabel ? <span className="text-xs font-bold leading-5 text-[var(--sub-text)]">{emptyLabel}</span> : <>
              <span className="text-sm font-bold text-[var(--primary-dark)]">{label}</span>
              <span className="mt-2 text-xs leading-5 text-[var(--sub-text)]">
                {mediaType === "video" ? "Video" : mediaType === "document" ? "Document" : "Image"}
                {required ? " · Required" : " · Optional"}
              </span>
              <span className="mt-1 text-xs leading-5 text-[var(--sub-text)]">{guide}</span>
              {process.env.NODE_ENV !== "production" ? <code className="mt-3 rounded bg-white/70 px-2 py-1 text-[10px] text-[var(--primary)]">CMS: {fieldName}</code> : null}
            </>}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`${desktopFill ? "md:h-full" : ""} ${fillContainer ? "h-full" : ""} ${className}`}>
      {renderContent(mobileRatio, "md:hidden", resolvedMobileSrc, fillContainer)}
      {renderContent(desktopRatio, "hidden md:block", resolvedDesktopSrc, desktopFill || fillContainer)}
      {expandedSrc ? (
        <div
          aria-label={`${label} 확대 이미지`}
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setExpandedSrc("")}
          role="dialog"
        >
          <div
            className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[900px] items-center justify-center overflow-hidden rounded-xl bg-white p-3 shadow-2xl sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              alt={alt || label}
              className="h-auto max-h-[calc(100dvh-72px)] w-auto max-w-full object-contain"
              height={1200}
              src={expandedSrc}
              unoptimized={expandedSrc.startsWith("http")}
              width={1600}
            />
            <button
              className="absolute top-3 right-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-black/20 bg-white px-4 text-sm font-extrabold text-black shadow-[0_2px_12px_rgba(0,0,0,0.24)]"
              onClick={() => setExpandedSrc("")}
              type="button"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
