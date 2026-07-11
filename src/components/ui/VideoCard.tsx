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
    <article className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
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
        {hasVideoError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--primary-deep)] px-6 text-center text-white">
            <p className="en text-sm font-bold text-[var(--accent-gold)]">
              Video Placeholder
            </p>
            <p className="mt-3 text-lg font-bold">{title}</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              최종 영상 파일을 이 위치에 교체하면 바로 재생 영역으로 사용할 수 있습니다.
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
