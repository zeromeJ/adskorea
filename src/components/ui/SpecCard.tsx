type SpecCardProps = {
  value: string;
  label: string;
};

export default function SpecCard({ value, label }: SpecCardProps) {
  return (
    <article
      aria-label={label}
      className="flex min-w-0 items-center justify-center rounded-lg border border-[var(--line)] bg-white px-1.5 py-4 text-center sm:p-5"
    >
      <p className="spec-value whitespace-nowrap text-[clamp(10px,2.8vw,20px)] font-bold leading-tight text-[var(--primary)]">
        {value}
      </p>
      {/* <p className="en mt-2 text-sm font-bold text-[var(--text)]">{label}</p> */}
    </article>
  );
}
