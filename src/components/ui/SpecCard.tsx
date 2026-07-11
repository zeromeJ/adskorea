type SpecCardProps = {
  value: string;
  label: string;
};

export default function SpecCard({ value, label }: SpecCardProps) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white p-5">
      <p className="spec-value text-2xl font-bold text-[var(--primary)]">
        {value}
      </p>
      <p className="en mt-2 text-sm font-bold text-[var(--text)]">{label}</p>
    </article>
  );
}
