type ModelSpec = {
  model: string;
  size: string;
  dynamicLoad: string;
  staticLoad: string;
  usage: string;
};

export default function ModelSpecTable({ specs }: { specs: ModelSpec[] }) {
  return (
    <>
      <div className="mt-8 grid gap-3 md:hidden">
        {specs.map((spec) => (
          <article
            className="rounded-lg border border-[var(--line)] bg-white p-4"
            key={spec.model}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-bold text-[var(--primary-dark)]">{spec.model}</h3>
              <span className="rounded-full bg-[var(--muted-surface)] px-3 py-1 text-xs font-semibold text-[var(--sub-text)]">
                {spec.usage}
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--sub-text)]">{spec.size}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-3">
              <div>
                <dt className="text-xs text-[var(--sub-text)]">동하중</dt>
                <dd className="number mt-1 font-bold text-[var(--text)]">{spec.dynamicLoad}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--sub-text)]">정하중</dt>
                <dd className="number mt-1 font-bold text-[var(--text)]">{spec.staticLoad}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-10 hidden overflow-hidden rounded-lg border border-[var(--line)] md:block">
        <table className="w-full border-collapse bg-white text-left text-sm">
          <thead className="en bg-[var(--muted-surface)] text-xs uppercase tracking-[0.08em] text-[var(--sub-text)]">
            <tr>
              <th className="p-4">모델군</th>
              <th className="p-4">대표 규격</th>
              <th className="p-4">동하중</th>
              <th className="p-4">정하중</th>
              <th className="p-4">추천 용도</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr className="border-t border-[var(--line)]" key={spec.model}>
                <td className="p-4 font-bold text-[var(--primary-dark)]">{spec.model}</td>
                <td className="p-4 text-[var(--sub-text)]">{spec.size}</td>
                <td className="number p-4 font-bold">{spec.dynamicLoad}</td>
                <td className="number p-4 font-bold">{spec.staticLoad}</td>
                <td className="p-4 text-[var(--sub-text)]">{spec.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
