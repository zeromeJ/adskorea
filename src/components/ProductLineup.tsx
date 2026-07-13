import ProductCard from "@/components/ui/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import ModelSpecTable from "@/components/ui/ModelSpecTable";
import { modelSpecs, products } from "@/lib/constants";

export default function ProductLineup() {
  return (
    <section id="products" className="bg-white px-5 pt-14 pb-16 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Product Lineup"
          title="다양한 산업에 맞춘 제품 라인업"
          description="제품 규격, 적재 중량, 보관 환경, 수출 조건에 따라 다양한 몰드 팔레트 제품군을 선택할 수 있습니다."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              className={product.title.includes("3D") ? "lg:col-span-2" : ""}
              featured={product.title.includes("3D")}
              key={product.title}
              {...product}
            />
          ))}
        </div>
        <ModelSpecTable specs={modelSpecs} />
        <p className="mt-4 text-sm leading-6 text-[var(--sub-text)]">
          대표 규격 외 모델과 상세 사양은 문의를 통해 확인 가능합니다.
        </p>
      </div>
    </section>
  );
}
