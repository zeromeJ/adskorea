type StatCardProps = {
  value: string;
  label: string;
  description?: string;
  dark?: boolean;
  compact?: boolean;
  company?: boolean;
};

export default function StatCard({
  value,
  label,
  description,
  dark = false,
  compact = false,
  company = false,
}: StatCardProps) {
  return (
    <div
      className={`rounded-lg border ${
        compact ? "p-3 sm:p-4" : company ? "px-4 py-3.5" : "p-5"
      } ${
        dark
          ? "border-white/12 bg-white/[0.04]"
          : "border-[var(--line)] bg-white"
      } ${
        company
          ? "transition duration-300 hover:border-[var(--primary)] hover:shadow-[0_8px_20px_rgba(16,37,29,0.06)]"
          : ""
      }`}
    >
      <div>
        <p
          className={`stat-value font-bold text-[var(--accent-gold)] ${
            compact
              ? "text-2xl sm:text-3xl"
              : company
                ? "whitespace-nowrap text-2xl"
                : "text-3xl"
          }`}
        >
          {value}
        </p>
        <p
          className={`en ${
            company
              ? "mt-1 whitespace-nowrap text-[11px] font-semibold tracking-[0.08em]"
              : "mt-2 text-sm font-bold"
          } ${
            dark ? "text-white" : "text-[var(--text)]"
          }`}
        >
          {label}
        </p>
      </div>
      {description ? (
        <p
          className={`${
            compact
              ? "mt-1 hidden text-xs leading-5 lg:block"
              : company
                ? "mt-1 whitespace-nowrap text-xs leading-5"
              : "mt-2 text-sm leading-6"
          } ${
            dark ? "text-white/62" : "text-[var(--sub-text)]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
