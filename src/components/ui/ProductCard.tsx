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
      className={`rounded-lg border p-5 ${
        featured
          ? "grid gap-6 border-[var(--sub-sage)] bg-[var(--muted-surface)] md:grid-cols-[0.9fr_1.1fr] md:items-center"
          : "border-[var(--line)] bg-white"
      } ${className}`}
    >
      <PalletVisual compact={!featured} />
      <div className="pt-3">
        {englishLabel ? (
          <p className="en mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent-gold)]">
            {englishLabel}
          </p>
        ) : null}
        <h3 className="text-xl font-bold text-[var(--text)]">{title}</h3>
        <p className="mt-3 leading-7 text-[var(--sub-text)]">{description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {specs.map((spec) => (
            <span
              className="en rounded-md border border-[var(--line)] bg-white px-3 py-1 text-xs font-bold text-[var(--primary)]"
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
