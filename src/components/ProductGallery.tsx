"use client";

import { useEffect, useState } from "react";
import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import { LinkButton } from "@/components/ui/Button";
import ProductCard, {
  type ProductCardProps,
} from "@/components/ui/ProductCard";

type ProductItem = Pick<
  ProductCardProps,
  "title" | "englishLabel" | "description" | "specs" | "mediaField" | "imageUrl" | "series" | "sizes" | "ratedDynamicLoad" | "ratedStaticLoad" | "disclaimer" | "relatedTests"
>;

type ProductGalleryProps = {
  products: ProductItem[];
};

const productAnchorIds = [
  "product-single-deck",
  "product-double-deck",
  "product-three-runner",
  "product-custom",
];

export default function ProductGallery({ products }: ProductGalleryProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );

  useEffect(() => {
    if (!selectedProduct) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProduct(null);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProduct]);

  return (
    <>
      <div className="mt-10 grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            className={product.title.includes("3D") ? "lg:col-span-2" : ""}
            featured={product.title.includes("3D")}
            id={productAnchorIds[index]}
            key={product.title}
            onOpen={() => setSelectedProduct(product)}
            pinSpecsToBottom={index >= 2}
            {...product}
          />
        ))}
      </div>

      {selectedProduct ? (
        <div
          aria-label={`${selectedProduct.title} 상세 정보`}
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(16,37,29,0.68)] p-2 backdrop-blur-[2px] sm:p-6"
          onPointerDown={() => setSelectedProduct(null)}
          role="dialog"
        >
          <div
            className="grid max-h-[calc(100dvh-32px)] w-[min(720px,calc(100vw-32px))] max-w-full gap-3 overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl bg-white p-4 shadow-[0_20px_60px_rgba(16,37,29,0.22)] sm:gap-4 sm:p-6"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="relative min-w-0 pr-16 sm:pr-20">
              <button
                aria-label="제품 상세 닫기"
                className="absolute top-0 right-0 inline-flex min-h-9 items-center justify-center rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                onClick={() => setSelectedProduct(null)}
                type="button"
              >
                닫기
              </button>
              {selectedProduct.englishLabel ? (
                <p className="en text-sm leading-5 font-bold uppercase tracking-[0.08em] text-[var(--accent-gold)] sm:text-base">
                  {selectedProduct.englishLabel}
                </p>
              ) : null}
              <h3 className="mt-1 text-2xl leading-tight font-bold text-[var(--text)] sm:mt-2 sm:text-3xl">
                {selectedProduct.title}
              </h3>
              <p className="mt-2 text-base leading-6 text-[var(--sub-text)] sm:mt-3 sm:leading-7">
                {selectedProduct.description}
              </p>
            </div>

            <MediaPlaceholder
              alt={`${selectedProduct.title} 제품 이미지`}
              desktopRatio="16:7"
              fieldName={selectedProduct.mediaField}
              guide="동일 각도·동일 스케일의 배경 제거 제품 이미지"
              label="제품 이미지"
              mobileRatio="16:8"
              expandable={false}
              src={selectedProduct.imageUrl}
            />

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {selectedProduct.specs.map((spec) => (
                <span
                  className="rounded-full border border-[var(--sub-sage)] bg-[var(--muted-surface)] px-3 py-1.5 text-sm font-bold text-[var(--primary-dark)] sm:px-4 sm:py-2 sm:text-base"
                  key={spec}
                >
                  {spec}
                </span>
              ))}
            </div>
            {(selectedProduct.series || selectedProduct.sizes?.length || selectedProduct.ratedDynamicLoad || selectedProduct.ratedStaticLoad) ? <dl className="grid gap-2 rounded-lg bg-[var(--muted-surface)] p-4 text-sm sm:grid-cols-2">{selectedProduct.series ? <div><dt className="text-xs text-[var(--sub-text)]">제품군</dt><dd className="mt-1 font-bold">{selectedProduct.series}</dd></div> : null}{selectedProduct.sizes?.length ? <div><dt className="text-xs text-[var(--sub-text)]">대표 규격</dt><dd className="mt-1 font-bold">{selectedProduct.sizes.join(", ")}</dd></div> : null}{selectedProduct.ratedDynamicLoad ? <div><dt className="text-xs text-[var(--sub-text)]">제조사 제시 동적하중</dt><dd className="mt-1 font-bold">{selectedProduct.ratedDynamicLoad}</dd></div> : null}{selectedProduct.ratedStaticLoad ? <div><dt className="text-xs text-[var(--sub-text)]">제조사 제시 정적하중</dt><dd className="mt-1 font-bold">{selectedProduct.ratedStaticLoad}</dd></div> : null}</dl> : null}
            {selectedProduct.relatedTests?.length ? <p className="text-sm leading-6 text-[var(--sub-text)]"><strong className="text-[var(--text)]">관련 시험자료:</strong> {selectedProduct.relatedTests.join(", ")}</p> : null}
            {selectedProduct.disclaimer ? <p className="text-xs leading-5 text-[var(--sub-text)]">{selectedProduct.disclaimer}</p> : null}
            <div className="flex justify-end"><LinkButton href="#inquiry" onClick={() => setSelectedProduct(null)}>견적 문의</LinkButton></div>
          </div>
        </div>
      ) : null}
    </>
  );
}
