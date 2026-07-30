"use client";

import { trackEvent } from "@/lib/trackEvent";

export default function ResponsiveVideo({
  title,
  poster,
  video720,
  video1080,
  fallback,
}: {
  title: string;
  poster?: string;
  video720?: string;
  video1080?: string;
  fallback?: string;
}) {
  const source = video720 || video1080 || fallback;
  if (!source) return null;
  return (
    <video
      aria-label={title}
      className="aspect-video w-full bg-black object-contain"
      controls
      onPlay={() => trackEvent("video_play", { title })}
      playsInline
      poster={poster}
      preload="none"
    >
      {video720 ? (
        <source media="(max-width: 767px)" src={video720} type="video/mp4" />
      ) : null}
      {video1080 ? <source src={video1080} type="video/mp4" /> : null}
      <source src={source} type="video/mp4" />
      영상 재생을 지원하지 않는 브라우저입니다.
    </video>
  );
}
