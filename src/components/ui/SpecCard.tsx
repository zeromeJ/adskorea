type SpecCardProps = {
  value: string;
  label: string;
};

export default function SpecCard({ value, label }: SpecCardProps) {
  return (
    <article
      aria-label={label}
      className="justify-center rounded-lg border border-[var(--line)] bg-white p-5 text-center"
    >
      <p className="spec-value text-xl font-bold text-[var(--primary)]">
        {value}
      </p>
      {/* <p className="en mt-2 text-sm font-bold text-[var(--text)]">{label}</p> */}
    </article>
  );
}
