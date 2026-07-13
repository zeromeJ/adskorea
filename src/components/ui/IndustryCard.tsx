type IndustryCardProps = {
  title: string;
  description?: string;
};

export default function IndustryCard({ title, description }: IndustryCardProps) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white p-4 transition duration-300 hover:border-[var(--sub-sage)] sm:p-5">
      <div className="mb-4 flex h-9 w-12 items-center justify-center overflow-hidden rounded-md border border-[var(--line)] bg-[var(--muted-surface)]">
        <svg
          aria-hidden="true"
          className="h-5 w-5 fill-none stroke-[var(--primary)]"
          viewBox="0 0 24 24"
        >
          <path d="M3 21V9l6 3V7l6 3V4h6v17H3Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M7 17h2m3 0h2m3 0h1" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-[var(--text)]">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">
          {description}
        </p>
      ) : null}
    </article>
  );
}
