type BenefitCardProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function BenefitCard({
  eyebrow,
  title,
  description,
}: BenefitCardProps) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white p-6 transition hover:-translate-y-1 hover:border-[var(--sub-sage)] hover:shadow-sm">
      <p className="number text-sm font-bold text-[var(--accent-gold)]">
        {eyebrow}
      </p>
      <h3 className="en mt-5 text-xl font-bold text-[var(--text)]">{title}</h3>
      <p className="mt-3 leading-7 text-[var(--sub-text)]">{description}</p>
    </article>
  );
}
