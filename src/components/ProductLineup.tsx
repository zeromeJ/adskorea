import ProductCard from "@/components/ui/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { products } from "@/lib/constants";

export default function ProductLineup() {
  return (
    <section id="products" className="bg-white px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Product Lineup"
          title="운송 환경과 제품 형상에 맞춰 선택하는 몰드 팔레트 라인업"
          description="표준 제품부터 3D 맞춤 몰드까지 산업별 물류 조건에 맞는 구성을 제공합니다."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.title} {...product} />
          ))}
        </div>
        <div className="mt-4">
          <ProductCard
            featured
            title="Customized 3D Molded Pallet"
            description="제품 형상, 하중 조건, 운송 경로, 수출 국가의 규정을 함께 검토해 고정력과 적재 안정성을 높이는 맞춤형 솔루션입니다."
            specs={["3D mold", "High retention", "Made for export"]}
          />
        </div>
      </div>
    </section>
  );
}
