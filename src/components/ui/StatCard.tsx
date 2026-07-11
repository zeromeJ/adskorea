type StatCardProps = {
  value: string;
  label: string;
  description?: string;
  dark?: boolean;
  inlineValueLabel?: boolean;
};

export default function StatCard({
  value,
  label,
  description,
  dark = false,
  inlineValueLabel = false,
}: StatCardProps) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        dark
          ? "border-white/12 bg-white/[0.04]"
          : "border-[var(--line)] bg-white"
      }`}
    >
      <div className={inlineValueLabel ? "flex items-end gap-3" : ""}>
        <p className="stat-value text-3xl font-bold text-[var(--accent-gold)]">
          {value}
        </p>
        <p
          className={`en ${inlineValueLabel ? "pb-0.5" : "mt-2"} text-sm font-bold ${
            dark ? "text-white" : ""
          }`}
        >
          {label}
        </p>
      </div>
      {description ? (
        <p
          className={`mt-2 text-sm leading-6 ${
            dark ? "text-white/62" : "text-[var(--sub-text)]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
