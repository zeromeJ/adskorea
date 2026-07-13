import PalletVisual from "@/components/ui/PalletVisual";

export type ProductCardProps = {
  title: string;
  englishLabel?: string;
  description: string;
  specs: string[];
  featured?: boolean;
  className?: string;
  onOpen?: () => void;
};

export default function ProductCard({
  title,
  englishLabel,
  description,
  specs,
  featured = false,
  className = "",
  onOpen,
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
          : "flex h-full flex-col border-[var(--line)] bg-white"
      } ${onOpen ? "cursor-pointer" : ""} ${className}`}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
    >
      <div className="relative">
        <PalletVisual
          aspect={
            featured ? "aspect-[16/10]" : "aspect-square sm:aspect-[5/4]"
          }
          compact={!featured}
        />
        {onOpen ? (
          <span className="absolute right-2 bottom-2 rounded-full bg-[rgba(16,37,29,0.82)] px-2 py-1 text-[9px] font-bold text-white sm:text-[10px]">
            크게 보기
          </span>
        ) : null}
      </div>
      <div
        className={`min-w-0 pt-3 sm:pt-4 ${featured ? "" : "flex flex-1 flex-col"}`}
      >
        {englishLabel ? (
          <p className="en mb-1.5 min-h-12 break-words text-[10px] leading-4 font-bold uppercase tracking-[0.06em] text-[var(--accent-gold)] sm:mb-2 sm:min-h-8 sm:text-xs sm:tracking-[0.1em]">
            {englishLabel}
          </p>
        ) : null}
        <h3 className="min-h-11 break-words text-base leading-snug font-bold text-[var(--text)] sm:min-h-14 sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-[13px] leading-5 text-[var(--sub-text)] sm:mt-3 sm:text-base sm:leading-7">
          {description}
        </p>
        <div className="mt-auto grid gap-1.5 pt-3 sm:gap-2 sm:pt-5">
          {specs.map((spec) => (
            <span
              className="en flex min-h-8 items-center justify-center rounded-full border border-[var(--sub-sage)] bg-[var(--muted-surface)] px-2 py-1 text-center text-[10px] leading-4 font-semibold text-[var(--primary-dark)] sm:min-h-9 sm:px-3 sm:py-1.5 sm:text-[11px]"
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
