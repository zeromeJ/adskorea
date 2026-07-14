import ProductGallery from "@/components/ProductGallery";
import { LinkButton } from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import ModelSpecTable from "@/components/ui/ModelSpecTable";
import { modelSpecs, products } from "@/lib/constants";

export default function ProductLineup() {
  return (
    <section id="products" className="bg-white px-5 pt-14 pb-24 sm:pb-16 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Product Lineup"
          title="다양한 산업에 맞춘 제품 라인업"
          description="제품 규격, 적재 중량, 보관 환경, 수출 조건에 따라 다양한 몰드 팔레트 제품군을 선택할 수 있습니다."
        />
        <ProductGallery products={products} />
        <ModelSpecTable specs={modelSpecs} />
        <div className="mx-auto max-w-[1080px]">
          <p className="mt-4 text-sm leading-6 text-[var(--sub-text)]">
            대표 규격 외 모델과 상세 사양은 문의를 통해 확인 가능합니다.
          </p>
          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-[var(--line)] bg-[var(--muted-surface)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="font-bold text-[var(--text)]">
              어떤 모델이 적합한지 모르시겠나요?
            </p>
            <LinkButton className="w-full shrink-0 sm:w-auto" href="#contact">
              문의하러 가기
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
