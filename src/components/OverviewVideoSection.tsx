import MediaPlaceholder from "@/components/ui/MediaPlaceholder";

type OverviewVideoSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  disclaimer: string;
  fieldName: string;
  videoUrl?: string;
  posterUrl?: string;
  muted?: boolean;
};

export default function OverviewVideoSection({
  id,
  eyebrow,
  title,
  description,
  disclaimer,
  fieldName,
  videoUrl,
  posterUrl,
  muted = false,
}: OverviewVideoSectionProps) {
  return (
    <section id={id} className={`${muted ? "bg-[var(--muted-surface)]" : ""} px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]`}>
      <div className="mx-auto grid max-w-[1120px] gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,1fr)] lg:items-center">
        <MediaPlaceholder
          className="order-2 min-w-0 overflow-hidden lg:order-1"
          desktopRatio="16:9"
          fieldName={`${fieldName}.poster`}
          guide="원본 영상 등록 완료 · 대표 장면을 사용한 썸네일 필요"
          label="영상 썸네일 / 16:9"
          mediaType="video"
          poster={posterUrl}
          src={videoUrl}
        />
        <div className="order-1 min-w-0 lg:order-2">
          <span className="inline-flex rounded-full bg-[var(--sub-mint)] px-3 py-1.5 text-xs font-bold text-[var(--primary-dark)]">제조사 제공 홍보영상</span>
          <p className="en mt-3 text-sm font-bold text-[var(--accent-gold-dark)]">{eyebrow}</p>
          <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold text-[var(--text)]">{title}</h2>
          <p className="mt-4 text-base leading-7 text-[var(--sub-text)]">{description}</p>
          <p className="mt-5 border-t border-[var(--line)] pt-4 text-[0.82rem] leading-5 text-[var(--sub-text)]">{disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
