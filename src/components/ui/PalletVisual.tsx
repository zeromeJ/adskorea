type PalletVisualProps = {
  compact?: boolean;
  dark?: boolean;
};

export default function PalletVisual({
  compact = false,
  dark = false,
}: PalletVisualProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-md border ${
        compact ? "aspect-[4/3]" : "aspect-[16/10]"
      } ${
        dark
          ? "border-white/10 bg-white/[0.04]"
          : "border-[var(--line)] bg-[var(--muted-surface)]"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(199,168,91,0.14),transparent_42%),linear-gradient(160deg,rgba(46,92,69,0.18),transparent_58%)]" />
      <div className="absolute left-1/2 top-1/2 h-[58%] w-[76%] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg]">
        {[0, 1, 2].map((item) => (
          <div
            className="absolute h-[28%] w-full rounded-[10px] bg-[var(--primary)] shadow-[0_18px_28px_rgba(16,37,29,0.18)]"
            key={item}
            style={{
              bottom: `${item * 25}%`,
              opacity: 0.98 - item * 0.08,
            }}
          >
            <div className="absolute left-[16%] top-1/2 h-[28%] w-[60%] -translate-y-1/2 rounded-full bg-white/90" />
          </div>
        ))}
        <div className="absolute -top-[8%] left-[12%] h-[30%] w-[58%] rounded-[6px] bg-[var(--primary-dark)] [clip-path:polygon(0_20%,45%_0,65%_32%,100%_18%,75%_72%,35%_88%)]" />
      </div>
    </div>
  );
}
