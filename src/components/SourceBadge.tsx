export type SourceKind =
  | "third-party"
  | "sgs"
  | "manufacturer"
  | "application"
  | "demonstration";

const labels: Record<SourceKind, string> = {
  "third-party": "제3자 시험",
  sgs: "SGS 검증",
  manufacturer: "제조사 제공 사양",
  application: "제조사 제공 적용 사례",
  demonstration: "제조사 제공 시연영상",
};

export default function SourceBadge({
  kind,
  label,
}: {
  kind: SourceKind;
  label?: string;
}) {
  const styles =
    kind === "third-party"
      ? "border-[var(--primary)] bg-[#f4f8f4] text-[var(--primary-dark)]"
      : kind === "sgs"
        ? "border-[var(--accent-gold-dark)] bg-[#fbf5e5] text-[#765b1b]"
        : "border-[#9aaa9f] bg-[#eef1ee] text-[#48534d]";
  return (
    <span
      className={`inline-flex min-h-7 items-center border px-2.5 text-xs font-extrabold ${styles}`}
    >
      {label || labels[kind]}
    </span>
  );
}
