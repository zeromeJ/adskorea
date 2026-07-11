import PalletVisual from "@/components/ui/PalletVisual";

type ProductCardProps = {
  title: string;
  description: string;
  specs: string[];
  featured?: boolean;
};

export default function ProductCard({
  title,
  description,
  specs,
  featured = false,
}: ProductCardProps) {
  return (
    <article
      className={`rounded-lg border p-5 ${
        featured
          ? "grid gap-6 border-[var(--sub-sage)] bg-[var(--muted-surface)] md:grid-cols-[0.9fr_1.1fr] md:items-center"
          : "border-[var(--line)] bg-white"
      }`}
    >
      <PalletVisual compact={!featured} />
      <div>
        <h3 className="en text-xl font-bold text-[var(--text)]">{title}</h3>
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
