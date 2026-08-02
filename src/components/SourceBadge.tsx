export type SourceKind =
  | "third-party"
  | "sgs"
  | "manufacturer"
  | "manufacturer-spec"
  | "official"
  | "application"
  | "demonstration";

const labels: Record<SourceKind, string> = {
  "third-party": "제3자 시험",
  sgs: "SGS 검증",
  manufacturer: "제조사 제공자료",
  "manufacturer-spec": "제조사 제시 사양",
  official: "공식 등록문서",
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
      ? "border-[var(--catalog-green)] bg-[var(--catalog-soft-green)] text-[var(--catalog-green-dark)]"
      : kind === "sgs"
        ? "border-[var(--catalog-gold)] bg-[var(--catalog-pale-gold)] text-[var(--catalog-green-dark)]"
        : kind === "manufacturer"
          ? "border-[var(--catalog-gold)] bg-[var(--catalog-pale-gold)] text-[var(--catalog-charcoal)]"
          : kind === "manufacturer-spec"
            ? "border-[var(--catalog-green)] bg-[var(--catalog-soft-green)] text-[var(--catalog-green-dark)]"
            : kind === "official"
              ? "border-[var(--catalog-muted)] bg-[var(--catalog-warm-gray)] text-[var(--catalog-green-dark)]"
        : "border-[var(--catalog-muted)] bg-[var(--catalog-warm-gray)] text-[var(--catalog-charcoal)]";
  return (
    <span
      className={`inline-flex min-h-7 items-center border px-2.5 text-xs font-extrabold ${styles}`}
    >
      {label || labels[kind]}
    </span>
  );
}
