type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
  dark?: boolean;
};

export default function SectionTitle({
  eyebrow,
  title,
  description,
  dark = false,
}: SectionTitleProps) {
  return (
    <div className="max-w-4xl">
      <p className="en text-sm font-bold uppercase tracking-[0.12em] text-[var(--accent-gold)]">
        {eyebrow}
      </p>
      <h2
        className={`mt-3 break-words text-3xl font-bold leading-tight [word-break:keep-all] sm:text-4xl ${
          dark ? "text-white" : "text-[var(--text)]"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 max-w-4xl text-base leading-8 ${
            dark ? "text-white/72" : "text-[var(--sub-text)]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
