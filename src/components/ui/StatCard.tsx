type StatCardProps = {
  value: string;
  label: string;
  description?: string;
  dark?: boolean;
  compact?: boolean;
  company?: boolean;
  className?: string;
};

export default function StatCard({
  value,
  label,
  description,
  dark = false,
  compact = false,
  company = false,
  className = "",
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
      } ${compact ? "flex h-full flex-col items-center justify-center text-center" : ""} ${className}`}
    >
      <div
        className={compact ? "flex flex-col items-center justify-center" : ""}
      >
        <p
          className={`stat-value font-bold text-[var(--accent-gold)] ${
            compact
              ? "text-2xl leading-none sm:text-3xl"
              : company
                ? "whitespace-nowrap text-xl sm:text-2xl"
                : "text-3xl"
          }`}
          style={company ? { fontFamily: "var(--font-kr)" } : undefined}
        >
          {value.split(/([가-힣]+)/g).map((part, index) =>
            /[가-힣]/.test(part) ? (
              <span
                key={`${part}-${index}`}
                style={{ fontFamily: "var(--font-kr)" }}
              >
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </p>
        <p
          className={`en ${
            company
              ? "mt-1 text-[12px] font-bold tracking-[0.03em]"
              : compact
                ? "mt-0 text-sm leading-none font-bold"
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
                ? "mt-1 whitespace-nowrap text-sm leading-5"
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
