"use client";

import { useEffect, useState } from "react";
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

export default function TestVideosSection({
  videos = [],
}: {
  videos?: PerformanceVideoItem[];
}) {
  const items = performanceVideoFallbacks.map((fallback, index) => ({
    ...fallback,
    ...videos[index],
  }));
  const [selectedVideo, setSelectedVideo] = useState<PerformanceVideoItem | null>(null);

  useEffect(() => {
    if (!selectedVideo) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedVideo(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedVideo]);

  return (
    <section id="performance-videos" className="bg-[var(--muted-surface)] px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]">
      <div className="mx-auto min-w-0 max-w-[1200px]">
        <SectionTitle
          eyebrow="Product Performance Demonstrations"
          title="제품 성능 시연 영상"
          description="실제 화물 또는 특정 환경을 가정해 촬영한 제조사 제공 시연 영상입니다. 영상은 제품의 구조와 상태를 직관적으로 확인하기 위한 참고자료이며, 공식 성능 판단은 별도의 제3자 시험성적서를 기준으로 검토하십시오."
        />
        <div className="touch-horizontal-scroller no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
          {items.map((video, index) => {
            const playable = Boolean(video.streamId || video.videoUrl);
            return (
              <article className="flex min-w-[88%] snap-start flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-white sm:min-w-[48%] md:min-w-0" key={video.category}>
                <button
                  aria-label={`${video.title} 영상 ${playable ? "재생" : "정보 확인"}`}
                  className="relative block w-full text-left disabled:cursor-default"
                  disabled={!playable}
                  onClick={() => setSelectedVideo(video)}
                  type="button"
                >
                  <MediaPlaceholder
                    alt={`${video.title} 영상 썸네일`}
                    desktopRatio="16:9"
                    fieldName={`performanceVideo.${index}.poster`}
                    guide="원본 영상 등록 완료 · 대표 장면을 사용한 썸네일 필요"
                    label="영상 썸네일 / 16:9"
                    expandable={false}
                    src={video.poster}
                  />
                  {playable ? <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(16,37,29,0.82)] text-white">▶</span></span> : null}
                  <span className="absolute right-2 bottom-2 rounded bg-[rgba(16,37,29,0.82)] px-2 py-1 text-xs font-bold text-white">{durationLabel(video.durationSeconds)}</span>
                </button>
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[var(--sub-mint)] px-2.5 py-1 text-xs font-bold text-[var(--primary-dark)]">제조사 제공 시연영상</span>
                    {video.hasRelatedReports ? <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs font-bold text-[var(--primary)]">관련 시험자료 있음</span> : null}
                  </div>
                  <p className="en mt-4 text-xs font-bold text-[var(--accent-gold-dark)]">{video.titleEn}</p>
                  <h3 className="mt-1 [overflow-wrap:anywhere] text-lg leading-7 font-bold text-[var(--text)]">{video.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--sub-text)]">{video.description}</p>
                  <p className="mt-auto pt-4 text-[0.8rem] font-bold leading-5 text-[var(--sub-text)]">공식 시험성적서를 대체하지 않습니다.</p>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-5 text-sm leading-6 text-[var(--sub-text)]">시연 결과는 제품 모델, 하중, 촬영조건과 사용환경에 따라 달라질 수 있습니다. 공식 성능은 별도의 시험성적서를 기준으로 확인하십시오.</p>
      </div>

      {selectedVideo ? (
        <div aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(16,37,29,0.76)] p-4" onPointerDown={() => setSelectedVideo(null)} role="dialog">
          <div className="flex max-h-[calc(100dvh-32px)] w-[min(900px,calc(100vw-32px))] max-w-full flex-col overflow-hidden rounded-xl bg-white p-4 sm:p-6" onPointerDown={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="min-w-0"><p className="en text-xs font-bold text-[var(--accent-gold-dark)]">{selectedVideo.titleEn}</p><h3 className="mt-1 text-lg font-bold text-[var(--text)]">{selectedVideo.title}</h3></div>
              <button className="shrink-0 rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-bold" onClick={() => setSelectedVideo(null)} type="button">닫기</button>
            </div>
            <div className="min-h-0 overflow-x-hidden overflow-y-auto [overscroll-behavior:contain]">
            <MediaPlaceholder
              desktopRatio="16:9"
              embedUrl={selectedVideo.streamId ? `https://iframe.videodelivery.net/${selectedVideo.streamId}` : undefined}
              fieldName="performanceVideo.streamId / externalUrl"
              guide="제조사 제공 원본 시연영상"
              label={selectedVideo.title}
              mediaType="video"
              poster={selectedVideo.poster}
              src={selectedVideo.videoUrl}
            />
            <p className="mt-4 text-sm leading-6 text-[var(--sub-text)]">{selectedVideo.description}</p>
            <div className="mt-3 rounded-md bg-[var(--muted-surface)] p-4"><p className="text-xs font-bold text-[var(--text)]">시연 조건 및 제한사항</p><p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">{selectedVideo.disclaimer}</p></div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
