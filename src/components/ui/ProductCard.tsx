import MediaPlaceholder from "@/components/ui/MediaPlaceholder";

export type ProductCardProps = {
  id?: string;
  title: string;
  englishLabel?: string;
  description: string;
  specs: string[];
  featured?: boolean;
  className?: string;
  onOpen?: () => void;
  pinSpecsToBottom?: boolean;
  mediaField: string;
  imageUrl?: string;
  series?: string;
  sizes?: string[];
  ratedDynamicLoad?: string;
  ratedStaticLoad?: string;
  disclaimer?: string;
  relatedTests?: string[];
};

export default function ProductCard({
  id,
  title,
  englishLabel,
  description,
  specs,
  featured = false,
  className = "",
  onOpen,
  pinSpecsToBottom = false,
  mediaField,
  imageUrl,
}: ProductCardProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (!onOpen || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onOpen();
  }

  return (
    <article
      aria-label={onOpen ? `${title} 상세 보기` : undefined}
      className={`min-w-0 rounded-lg border p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[0_12px_28px_rgba(16,37,29,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:p-5 ${
        featured
          ? "grid gap-6 border-[var(--sub-sage)] bg-[var(--muted-surface)] md:grid-cols-[0.9fr_1.1fr] md:items-center"
          : pinSpecsToBottom
            ? "flex h-full flex-col border-[var(--line)] bg-white"
            : "h-full border-[var(--line)] bg-white"
      } ${onOpen ? "cursor-pointer" : ""} ${className}`}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      id={id}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
    >
      <div className="relative">
        <MediaPlaceholder
          alt={`${title} 제품 이미지`}
          desktopRatio="4:3"
          fieldName={mediaField}
          guide="동일 각도·동일 스케일의 배경 제거 제품 이미지"
          label="제품 이미지"
          mobileRatio="4:3"
          expandable={false}
          src={imageUrl}
        />
        {onOpen ? (
          <span className="pointer-events-none absolute top-2 right-2 rounded-md border border-white/60 bg-black/55 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-[2px] sm:top-3 sm:right-3 sm:px-3 sm:text-xs">
            자세히 보기
          </span>
        ) : null}
      </div>
      <div
        className={`min-w-0 pt-3 sm:pt-4 ${
          pinSpecsToBottom ? "flex flex-1 flex-col" : ""
        }`}
      >
        {englishLabel ? (
          <p className="en mb-2 text-xs leading-4 font-bold uppercase tracking-[0.1em] text-[var(--accent-gold)]">
            {englishLabel}
          </p>
        ) : null}
        <h3 className="break-words text-lg leading-snug font-bold text-[var(--text)] sm:text-[22px]">
          {title}
        </h3>
        <p className="mt-3 leading-7 text-[var(--sub-text)]">
          {description}
        </p>
        <div
          className={`flex flex-wrap gap-1.5 sm:gap-2 ${
            pinSpecsToBottom ? "mt-auto pt-5" : "mt-4 sm:mt-5"
          }`}
        >
          {specs.map((spec) => (
            <span
              className="en rounded-full border border-[var(--sub-sage)] bg-[var(--muted-surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--primary-dark)]"
              key={spec}
            >
              {spec}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
