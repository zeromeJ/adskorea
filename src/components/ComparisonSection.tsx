import SectionTitle from "@/components/ui/SectionTitle";
import { comparisonRows } from "@/lib/constants";

export default function ComparisonSection() {
  return (
    <section
      id="comparison"
      className="bg-[var(--primary-deep)] px-5 py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          dark
          eyebrow="Comparison"
          title="수출 포장과 공간 효율이 중요한 B2B 물류에 강합니다."
          description="플라스틱 팔레트는 위생, 식품, 제약, 폐쇄형 회수 물류에서 강점이 있습니다. ADS 아델슨은 수출 포장, 적층 보관, 친환경 소재, 비용 효율 중심의 선택지입니다."
        />
        <div className="mt-10 overflow-x-auto rounded-lg border border-white/12">
          <table className="w-full min-w-[860px] border-collapse bg-[var(--primary-dark)] text-left text-sm text-white">
            <thead>
              <tr className="en border-b border-white/12 text-xs uppercase tracking-[0.08em] text-white/70">
                <th className="p-4">Comparison Item</th>
                <th className="p-4">Wooden Pallet</th>
                <th className="p-4">Plastic Pallet</th>
                <th className="bg-[rgba(199,168,91,0.12)] p-4 text-[var(--accent-gold)]">
                  Adson Molded Pallet
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr className="border-b border-white/10 last:border-0" key={row[0]}>
                  {row.map((cell, index) => (
                    <td
                      className={`p-4 leading-7 ${
                        index === 3
                          ? "bg-[rgba(199,168,91,0.1)] font-bold text-white"
                          : "text-white/72"
                      } ${index === 0 ? "en font-bold text-white" : ""}`}
                      key={cell}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
