type BenefitCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  points?: string[];
};

export default function BenefitCard({
  eyebrow,
  title,
  description,
  points = [],
}: BenefitCardProps) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white p-6 transition hover:-translate-y-1 hover:border-[var(--sub-sage)] hover:shadow-sm">
      <p className="en text-sm font-bold text-[var(--accent-gold)]">
        {eyebrow}
      </p>
      <h3 className="mt-5 text-2xl font-bold text-[var(--text)]">{title}</h3>
      <p className="mt-3 leading-7 text-[var(--sub-text)]">{description}</p>
      {points.length ? (
        <ul className="mt-5 grid gap-2">
          {points.map((point) => (
            <li className="flex items-center gap-2 text-sm font-bold text-[var(--primary-dark)]" key={point}>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
              {point}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
