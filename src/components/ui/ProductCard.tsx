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
      className={`rounded-lg border p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[0_12px_28px_rgba(16,37,29,0.08)] sm:p-5 ${
        featured
          ? "grid gap-6 border-[var(--sub-sage)] bg-[var(--muted-surface)] md:grid-cols-[0.9fr_1.1fr] md:items-center"
          : "border-[var(--line)] bg-white"
      } ${className}`}
    >
      <PalletVisual
        aspect={featured ? "aspect-[16/10]" : "aspect-[16/10] sm:aspect-[5/4]"}
        compact={!featured}
      />
      <div className="pt-3 sm:pt-4">
        {englishLabel ? (
          <p className="en mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent-gold)]">
            {englishLabel}
          </p>
        ) : null}
        <h3 className="text-xl font-bold text-[var(--text)]">{title}</h3>
        <p className="mt-3 leading-7 text-[var(--sub-text)]">{description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
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
