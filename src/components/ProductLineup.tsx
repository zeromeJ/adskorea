import ProductGallery from "@/components/ProductGallery";
import { LinkButton } from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import ModelSpecTable from "@/components/ui/ModelSpecTable";
import { modelSpecDisclaimer, modelSpecs, products } from "@/lib/constants";

export default function ProductLineup({
  items = products,
}: {
  items?: typeof products;
}) {
  return (
    <section id="product-lineup" className="bg-white px-5 pt-12 pb-[88px] sm:pb-14 lg:px-8 lg:pb-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Product Lineup"
          title="화물과 운용조건에 맞춘 제품 라인업"
          description="제품 유형, 규격, 제조사 제시 하중과 주요 검토 용도를 비교한 뒤 실제 적용조건을 확인합니다."
        />
        <ProductGallery products={items} />
        <ModelSpecTable specs={modelSpecs} />
        <div className="mx-auto max-w-[1080px]">
          <p className="mt-4 text-sm leading-6 font-medium text-[var(--sub-text)]">
            {modelSpecDisclaimer}
          </p>
          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-[var(--line)] bg-[var(--muted-surface)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="font-bold text-[var(--text)]">
              어떤 모델이 적합한지 모르시겠나요?
            </p>
            <LinkButton className="w-full shrink-0 sm:w-auto" href="#inquiry">
              견적 및 문의
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
