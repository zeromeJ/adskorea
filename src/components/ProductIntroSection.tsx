import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import SectionTitle from "@/components/ui/SectionTitle";
import { LinkButton } from "@/components/ui/Button";

type ProductIntroSectionProps = {
  imageUrl?: string;
};

export default function ProductIntroSection({
  imageUrl,
}: ProductIntroSectionProps) {
  return (
    <section id="product-overview" className="px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <MediaPlaceholder
          alt="MDI 압축성형 목재 팔레트 제품 구조"
          className="order-2 lg:order-1"
          desktopRatio="4:3"
          fieldName="homePage.overview.image"
          guide="배경을 제거한 실제 제품 또는 제품 구조 확인 이미지"
          label="제품 개요 이미지"
          mobileRatio="4:3"
          src={imageUrl}
        />
        <div className="order-1 lg:order-2">
          <SectionTitle
            eyebrow="Product Overview"
            title="MDI 압축성형 목재 팔레트"
            description="MDI-bonded Compressed Wood Pallet"
          />
          <p className="mt-3 text-base leading-8 text-[var(--sub-text)]">
            목질 원료와 농림업 부산물 등을 선별·분쇄한 후 MDI계 접착
            시스템을 혼합하고, 고온·고압 조건에서 일체형으로 압축성형한
            산업용 물류 팔레트입니다.
          </p>
          <div className="mt-7 rounded-lg border border-[var(--line)] bg-white p-5">
            <p className="font-bold text-[var(--primary-dark)]">적용 전 확인사항</p>
            <p className="mt-2 text-sm leading-7 text-[var(--sub-text)]">
              제품 규격, 하중 분포, 지게차 진입 방향, 랙 구조, 보관환경과
              목적국 규정을 함께 확인해야 합니다. 모델별 상세 사양은 기술
              검토 후 확정됩니다.
            </p>
          </div>
          <div className="mt-7">
            <LinkButton className="!min-h-10 !px-3 !py-2 text-xs" href="#product-lineup">제품 라인업 보기</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
