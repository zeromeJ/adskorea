type IndustryCardProps = {
  title: string;
};

export default function IndustryCard({ title }: IndustryCardProps) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white p-5">
      <div className="mb-5 h-10 w-10 rounded-md bg-[var(--sub-mint)]" />
      <h3 className="en text-lg font-bold text-[var(--text)]">{title}</h3>
    </article>
  );
}
