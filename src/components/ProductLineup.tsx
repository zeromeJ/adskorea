import ProductCard from "@/components/ui/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { modelSpecs, products } from "@/lib/constants";

export default function ProductLineup() {
  return (
    <section id="products" className="bg-white px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Product Lineup"
          title="다양한 산업에 맞춘 제품 라인업"
          description="제품 규격, 적재 중량, 보관 환경, 수출 조건에 따라 다양한 몰드 팔레트 제품군을 선택할 수 있습니다."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              featured={product.title.includes("3D")}
              key={product.title}
              {...product}
            />
          ))}
        </div>
        <div className="mt-10 overflow-x-auto rounded-lg border border-[var(--line)]">
          <table className="w-full min-w-[780px] border-collapse bg-white text-left text-sm">
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
              {modelSpecs.map((spec) => (
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
        <p className="mt-4 text-sm leading-6 text-[var(--sub-text)]">
          대표 규격 외 모델과 상세 사양은 문의를 통해 확인 가능합니다.
        </p>
      </div>
    </section>
  );
}
