type ModelSpec = {
  model: string;
  type: string;
  size: string;
  dynamicLoad: string;
  staticLoad: string;
  usage: string;
};

type ModelSpecTableProps = {
  specs: ModelSpec[];
};

function SizeText({ size }: { size: string }) {
  const suffix = " 등";

  if (!size.endsWith(suffix)) return <>{size}</>;

  return (
    <>
      {size.slice(0, -suffix.length)}
      <span className="font-normal text-[var(--sub-text)]">{suffix}</span>
    </>
  );
}

export default function ModelSpecTable({ specs }: ModelSpecTableProps) {
  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="mt-8 grid gap-3 lg:hidden">
        {specs.map((spec) => (
          <article
            className="rounded-lg border border-[var(--line)] bg-white p-4 transition-colors hover:border-[var(--primary)] hover:bg-[var(--muted-surface)]"
            key={spec.model}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-[var(--primary)]">
                {spec.model}
              </h3>
              <span
                className="rounded-full bg-[var(--sub-mint)] px-3 py-1 text-xs font-bold text-[var(--primary-dark)]"
              >
                {spec.usage}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-3">
              <div className="col-span-2 rounded-md bg-[var(--muted-surface)] px-3 py-2.5">
                <dt className="text-xs text-[var(--sub-text)]">유형</dt>
                <dd className="mt-1 text-sm font-bold text-[var(--text)]">
                  {spec.type}
                </dd>
              </div>
              <div className="col-span-2 rounded-md bg-[var(--muted-surface)] px-3 py-2.5">
                <dt className="text-xs text-[var(--sub-text)]">대표 규격</dt>
                <dd className="number mt-1 whitespace-nowrap text-sm font-bold text-[var(--text)]">
                  <SizeText size={spec.size} />
                </dd>
              </div>
              <div className="rounded-md bg-[var(--muted-surface)] px-3 py-2.5">
                <dt className="text-xs text-[var(--sub-text)]">
                  제조사 제시 동적하중
                </dt>
                <dd className="number mt-1 whitespace-nowrap text-sm font-bold text-[var(--text)]">
                  {spec.dynamicLoad}
                </dd>
              </div>
              <div className="rounded-md bg-[var(--muted-surface)] px-3 py-2.5">
                <dt className="text-xs text-[var(--sub-text)]">
                  제조사 제시 정적하중
                </dt>
                <dd className="number mt-1 whitespace-nowrap text-sm font-bold text-[var(--text)]">
                  {spec.staticLoad}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-10 hidden overflow-hidden rounded-lg border border-[var(--line)] lg:block">
        <table className="w-full border-collapse bg-white text-left text-sm">
          <thead className="bg-[var(--muted-surface)] text-xs font-bold text-[var(--primary-dark)] lg:text-sm">
            <tr>
              <th className="px-3 py-4 lg:px-5">모델군</th>
              <th className="px-3 py-4 lg:px-5">유형</th>
              <th className="px-3 py-4 lg:px-5">대표 규격</th>
              <th className="px-3 py-4 lg:px-5">제조사 제시 동적하중</th>
              <th className="px-3 py-4 lg:px-5">제조사 제시 정적하중</th>
              <th className="px-3 py-4 lg:px-5">제조사 제시 적용 용도</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr
                className="border-t border-[var(--line)] transition-colors hover:bg-[var(--muted-surface)]"
                key={spec.model}
              >
                <td className="whitespace-nowrap px-3 py-4 font-bold text-[var(--primary)] lg:px-5 lg:py-5">
                  {spec.model}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-[var(--text)] lg:px-5 lg:py-5">
                  {spec.type}
                </td>
                <td className="number whitespace-nowrap px-3 py-4 text-[var(--text)] lg:px-5 lg:py-5">
                  <SizeText size={spec.size} />
                </td>
                <td className="number whitespace-nowrap px-3 py-4 font-bold text-[var(--text)] lg:px-5 lg:py-5">
                  {spec.dynamicLoad}
                </td>
                <td className="number whitespace-nowrap px-3 py-4 font-bold text-[var(--text)] lg:px-5 lg:py-5">
                  {spec.staticLoad}
                </td>
                <td className="px-3 py-4 lg:px-5 lg:py-5">
                  <span className="inline-flex whitespace-nowrap rounded-full bg-[var(--sub-mint)] px-3 py-1.5 text-xs font-bold text-[var(--primary-dark)]">
                    {spec.usage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
