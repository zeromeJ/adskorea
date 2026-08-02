"use client";

import { useEffect, useRef, useState } from "react";
import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import SectionTitle from "@/components/ui/SectionTitle";
import { performanceVideoFallbacks } from "@/lib/constants";

export type PerformanceVideoItem = {
  title: string;
  titleEn?: string;
  category?: string;
  durationSeconds?: number;
  streamId?: string;
  videoUrl?: string;
  poster?: string;
  description?: string;
  disclaimer?: string;
  hasRelatedReports?: boolean;
};

function durationLabel(seconds?: number) {
  if (!seconds) return "길이 확인 필요";
  if (seconds < 60) return `${seconds}초`;
  return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
}

function VideoPlayer({
  poster,
  src,
  title,
}: {
  poster?: string;
  src: string;
  title: string;
}) {
  return (
    <video
      aria-label={`${title} 영상`}
      className="block h-full w-full object-contain"
      controls
      playsInline
      poster={poster}
      preload="metadata"
      src={src}
    />
  );
}

export default function TestVideosSection({
  videos = [],
  catalogMode = false,
}: {
  videos?: PerformanceVideoItem[];
  catalogMode?: boolean;
}) {
  const items = catalogMode
    ? videos.slice(0, 6)
    : performanceVideoFallbacks.map((fallback, index) => ({
        ...fallback,
        ...videos[index],
      }));
  const [selectedVideo, setSelectedVideo] = useState<PerformanceVideoItem | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedVideo) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedVideo(null);
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button, a[href], iframe, video[controls], [tabindex]:not([tabindex='-1'])",
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
    };
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousTriggerRef.current?.focus();
    };
  }, [selectedVideo]);

  return (
    <section id="performance-videos" className={`${catalogMode ? "bg-[var(--catalog-charcoal)] text-white" : "bg-[var(--muted-surface)]"} px-5 pt-20 pb-16 lg:px-8 lg:pt-24 lg:pb-24`}>
      <div className="mx-auto min-w-0 max-w-[1200px]">
        <SectionTitle
          dark={catalogMode}
          eyebrow={catalogMode ? "Performance Videos" : "Product Performance Demonstrations"}
          title={catalogMode ? "실제 시험과 시연 장면" : "제품 성능 시연 영상"}
          description="CMS에 등록된 제목과 조건을 기준으로 공개하는 제조사 제공 시연 영상입니다. 공식 성능 판단은 별도의 시험기관 발행자료를 확인하십시오."
        />
        {items.length ? <div className="touch-horizontal-scroller no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
          {items.map((video, index) => {
            const playable = Boolean(video.streamId || video.videoUrl);
            return (
              <article className={`flex min-w-[88%] snap-start flex-col overflow-hidden border sm:min-w-[48%] md:min-w-0 ${catalogMode ? "border-white/15 bg-white/[0.045]" : "border-[var(--line)] bg-white"}`} key={video.category}>
                <button
                  aria-label={`${video.title} 영상 ${playable ? "재생" : "정보 확인"}`}
                  className="relative block w-full text-left disabled:cursor-default"
                  disabled={!playable}
                  onClick={(event) => {
                    previousTriggerRef.current = event.currentTarget;
                    setSelectedVideo(video);
                  }}
                  type="button"
                >
                  {video.videoUrl && !video.poster ? (
                    <video aria-label={`${video.title} 영상 미리보기`} className="block aspect-video w-full bg-black object-cover" muted playsInline preload="metadata" src={`${video.videoUrl}#t=0.1`} />
                  ) : (
                    <MediaPlaceholder
                      alt={`${video.title} 영상 썸네일`}
                      className="[&>div]:rounded-b-none [&>div]:rounded-t-lg"
                      desktopRatio="16:9"
                      fieldName={`performanceVideo.${index}.poster`}
                      guide="영상을 등록하면 첫 장면을 미리보기로 사용합니다."
                      label="영상 미리보기 / 16:9"
                      expandable={false}
                      src={video.poster}
                    />
                  )}
                  {playable ? <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(16,37,29,0.82)] text-white">▶</span></span> : null}
                  <span className="absolute right-2 bottom-2 rounded bg-[rgba(16,37,29,0.82)] px-2 py-1 text-xs font-bold text-white">{durationLabel(video.durationSeconds)}</span>
                </button>
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  {video.hasRelatedReports ? <span className="self-start rounded-full border border-[var(--line)] px-2.5 py-1 text-xs font-bold text-[var(--primary)]">관련 시험자료 있음</span> : null}
                  <p className={`en text-xs font-bold text-[var(--accent-gold-dark)] ${video.hasRelatedReports ? "mt-4" : "mt-1"}`}>{video.titleEn}</p>
                  <h3 className={`mt-1 [overflow-wrap:anywhere] text-lg leading-7 font-bold ${catalogMode ? "text-[var(--catalog-cream)]" : "text-[var(--text)]"}`}>{video.title}</h3>
                  <p className={`mt-3 line-clamp-2 text-sm leading-6 ${catalogMode ? "text-white/55" : "text-[var(--sub-text)]"}`}>{video.description}</p>
                </div>
              </article>
            );
          })}
        </div> : <div className={`mt-8 border border-dashed p-8 text-base leading-8 ${catalogMode ? "border-white/20 bg-white/[0.035] text-white/55" : "border-[var(--sub-sage)] bg-white text-[var(--sub-text)]"}`}>제목, 시험조건과 영상 원본이 함께 확인된 시연 영상이 등록되면 표시됩니다.</div>}
        <p className={`mt-5 text-sm leading-6 ${catalogMode ? "text-white/45" : "text-[var(--sub-text)]"}`}>시연 결과는 제품 모델, 하중, 촬영조건과 사용환경에 따라 달라질 수 있습니다. 공식 성능은 별도의 시험성적서를 기준으로 확인하십시오.</p>
      </div>

      {selectedVideo ? (
        <div aria-labelledby="performance-video-dialog-title" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(16,37,29,0.76)] p-4" onPointerDown={() => setSelectedVideo(null)} role="dialog">
          <div className="flex max-h-[calc(100dvh-32px)] w-[min(900px,calc(100vw-32px))] max-w-full flex-col overflow-hidden rounded-xl bg-white p-4 sm:p-6" onPointerDown={(event) => event.stopPropagation()} ref={dialogRef}>
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="min-w-0"><p className="en text-xs font-bold text-[var(--accent-gold-dark)]">{selectedVideo.titleEn}</p><h3 className="mt-1 text-lg font-bold text-[var(--text)]" id="performance-video-dialog-title">{selectedVideo.title}</h3></div>
              <button className="shrink-0 rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-bold" onClick={() => setSelectedVideo(null)} ref={closeRef} type="button">닫기</button>
            </div>
            <div className="min-h-0 overflow-x-hidden overflow-y-auto [overscroll-behavior:contain]">
            <div className="aspect-video overflow-hidden rounded-lg border border-[var(--line)] bg-black">
              {selectedVideo.streamId ? (
                <iframe
                  allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                  src={`https://iframe.videodelivery.net/${selectedVideo.streamId}`}
                  title={selectedVideo.title}
                />
              ) : selectedVideo.videoUrl ? (
                <VideoPlayer
                  poster={selectedVideo.poster}
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                />
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--sub-text)]">{selectedVideo.description}</p>
            <div className="mt-3 rounded-md bg-[var(--muted-surface)] p-4"><p className="text-xs font-bold text-[var(--text)]">시연 조건 및 제한사항</p><p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">{selectedVideo.disclaimer}</p></div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
