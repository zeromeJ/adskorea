"use client";

import { useState } from "react";

type VideoCardProps = {
  title: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
};

export default function VideoCard({
  title,
  description,
  videoSrc,
  posterSrc,
}: VideoCardProps) {
  const [hasVideoError, setHasVideoError] = useState(false);

  return (
    <article className="overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_12px_30px_rgba(16,37,29,0.06)]">
      <div className="relative aspect-video bg-[var(--primary-deep)]">
        <video
          className="h-full w-full object-cover"
          controls
          onError={() => setHasVideoError(true)}
          poster={posterSrc}
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        {!hasVideoError ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,transparent_55%,rgba(16,37,29,0.26))]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-[rgba(16,37,29,0.82)] text-white shadow-lg">
              <svg aria-hidden="true" className="ml-1 h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="m8 5 11 7-11 7V5Z" />
              </svg>
            </span>
          </div>
        ) : null}
        {hasVideoError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--primary-deep)] px-6 text-center text-white">
            <p className="en text-sm font-bold text-[var(--accent-gold)]">
              Corporate Media
            </p>
            <p className="mt-3 text-lg font-bold">{title}</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              제품 및 생산 기술 소개 영상이 준비 중입니다.
            </p>
          </div>
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-[var(--text)]">{title}</h3>
        <p className="mt-3 leading-7 text-[var(--sub-text)]">{description}</p>
      </div>
    </article>
  );
}
