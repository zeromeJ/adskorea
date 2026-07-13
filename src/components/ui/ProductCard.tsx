import PalletVisual from "@/components/ui/PalletVisual";

type ProductCardProps = {
  title: string;
  englishLabel?: string;
  description: string;
  specs: string[];
  featured?: boolean;
  className?: string;
};

export default function ProductCard({
  title,
  englishLabel,
  description,
  specs,
  featured = false,
  className = "",
}: ProductCardProps) {
  return (
    <article
      className={`min-w-0 rounded-lg border p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[0_12px_28px_rgba(16,37,29,0.08)] sm:p-5 ${
        featured
          ? "grid gap-6 border-[var(--sub-sage)] bg-[var(--muted-surface)] md:grid-cols-[0.9fr_1.1fr] md:items-center"
          : "border-[var(--line)] bg-white"
      } ${className}`}
    >
      <PalletVisual
        aspect={featured ? "aspect-[16/10]" : "aspect-[16/10] sm:aspect-[5/4]"}
        compact={!featured}
      />
      <div className="min-w-0 pt-3 sm:pt-4">
        {englishLabel ? (
          <p className="en mb-1.5 break-words text-[10px] leading-4 font-bold uppercase tracking-[0.06em] text-[var(--accent-gold)] sm:mb-2 sm:text-xs sm:tracking-[0.1em]">
            {englishLabel}
          </p>
        ) : null}
        <h3 className="break-words text-base leading-snug font-bold text-[var(--text)] sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-[13px] leading-5 text-[var(--sub-text)] sm:mt-3 sm:text-base sm:leading-7">
          {description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1 sm:mt-5 sm:gap-2">
          {specs.map((spec) => (
            <span
              className="en rounded-full border border-[var(--sub-sage)] bg-[var(--muted-surface)] px-2 py-1 text-[10px] leading-4 font-semibold text-[var(--primary-dark)] sm:px-3 sm:py-1.5 sm:text-[11px]"
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
