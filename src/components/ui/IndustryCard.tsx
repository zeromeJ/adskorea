type IndustryCardProps = {
  title: string;
  description?: string;
};

export default function IndustryCard({ title, description }: IndustryCardProps) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white p-5">
      <div className="mb-5 h-10 w-10 rounded-md bg-[var(--sub-mint)]" />
      <h3 className="text-lg font-bold text-[var(--text)]">{title}</h3>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-[var(--sub-text)]">
          {description}
        </p>
      ) : null}
    </article>
  );
}
