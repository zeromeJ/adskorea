"use client";

import { useEffect, useState } from "react";
import PalletVisual from "@/components/ui/PalletVisual";
import ProductCard, {
  type ProductCardProps,
} from "@/components/ui/ProductCard";

type ProductItem = Pick<
  ProductCardProps,
  "title" | "englishLabel" | "description" | "specs"
>;

type ProductGalleryProps = {
  products: ProductItem[];
};

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
      <div className="mt-10 grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            className={product.title.includes("3D") ? "lg:col-span-2" : ""}
            featured={product.title.includes("3D")}
            key={product.title}
            onOpen={() => setSelectedProduct(product)}
            {...product}
          />
        ))}
      </div>

      {selectedProduct ? (
        <div
          aria-label={`${selectedProduct.title} 상세 정보`}
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(16,37,29,0.68)] p-4 backdrop-blur-[2px] sm:p-6"
          onPointerDown={() => setSelectedProduct(null)}
          role="dialog"
        >
          <div
            className="relative max-h-[calc(100dvh-32px)] w-full max-w-[960px] overflow-y-auto rounded-xl bg-white p-4 shadow-[0_20px_60px_rgba(16,37,29,0.22)] sm:p-6 lg:p-8"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              aria-label="제품 상세 닫기"
              className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-2xl leading-none font-medium text-[var(--text)] shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              onClick={() => setSelectedProduct(null)}
              type="button"
            >
              ×
            </button>

            <div className="grid gap-5 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-8 lg:pt-0">
              <PalletVisual aspect="aspect-square lg:aspect-[4/3]" />
              <div className="min-w-0">
                {selectedProduct.englishLabel ? (
                  <p className="en text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent-gold)]">
                    {selectedProduct.englishLabel}
                  </p>
                ) : null}
                <h3 className="mt-2 pr-10 text-2xl leading-tight font-bold text-[var(--text)] sm:text-3xl lg:pr-0">
                  {selectedProduct.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--sub-text)] sm:text-base sm:leading-8">
                  {selectedProduct.description}
                </p>
                <div className="mt-5 grid gap-2">
                  {selectedProduct.specs.map((spec) => (
                    <div
                      className="rounded-lg border border-[var(--line)] bg-[var(--muted-surface)] px-4 py-3 text-sm font-bold text-[var(--primary-dark)]"
                      key={spec}
                    >
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
