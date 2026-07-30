import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Info, PackageSearch } from "lucide-react";
import CatalogDownload from "@/components/CatalogDownload";
import ResponsiveVideo from "@/components/ResponsiveVideo";
import TrackedLink from "@/components/TrackedLink";
import {
  modelSpecDisclaimer,
  modelSpecs,
  products as fallbackProducts,
} from "@/lib/constants";
import { getWebsiteContent } from "@/lib/websiteContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "제품",
  description:
    "아델슨 MDI 압축성형 목재 팔레트 4개 제품군과 AD·AC·AS 모델 비교, 제품 선택 가이드를 확인하세요.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const cms = await getWebsiteContent();
  const products = (
    cms?.products?.length ? cms.products : fallbackProducts
  ).map((product) => ({
    ...product,
    imageUrl:
      "imageUrl" in product && typeof product.imageUrl === "string"
        ? product.imageUrl
        : undefined,
  }));
  const relatedDocuments = (cms?.documents || []).filter(
    (document) =>
      document.documentType.includes("성능") ||
      document.documentType.includes("포름알데히드"),
  );

  return (
    <main id="main-content">
      <section className="border-b border-[var(--line)] px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] items-start gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
              Products
            </p>
            <h1 className="mt-4 text-4xl font-extrabold text-[var(--primary-deep)] lg:text-6xl">
              화물과 설비 조건부터
              <br />
              맞춰보는 제품 선택
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--sub-text)]">
              제품군별 구조와 제조사 제공 사양, 제3자 시험 확인값을 분리해
              검토할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <CatalogDownload location="products_hero" />
            <TrackedLink
              className="inline-flex min-h-12 items-center gap-2 bg-[var(--primary-dark)] px-5 font-extrabold text-white"
              eventName="product_inquiry_click"
              eventProperties={{ location: "products_hero" }}
              href="/#inquiry"
            >
              제품 적용 문의
              <ArrowRight aria-hidden="true" size={17} />
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8 lg:py-24" id="lineup">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-3xl font-extrabold">제품군 4종</h2>
          <div className="mt-10 grid gap-8">
            {products.map((product, index) => (
              <article
                className="grid overflow-hidden border border-[var(--line)] bg-white lg:grid-cols-[0.85fr_1.15fr]"
                id={`lineup-${index + 1}`}
                key={product.title}
              >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#d8d8d8] lg:aspect-auto lg:h-full lg:min-h-[360px]">
                  {product.imageUrl ? (
                    <Image
                      alt={product.title}
                      className="object-contain"
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1023px) 100vw, 43vw"
                      src={product.imageUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <PackageSearch
                        aria-hidden="true"
                        className="text-[var(--sub-sage)]"
                        size={48}
                      />
                    </div>
                  )}
                </div>
                <div className="p-6 lg:p-10">
                  <div className="lg:flex lg:items-start lg:justify-between lg:gap-5">
                    <div>
                      <p className="en text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-gold-dark)]">
                        {product.englishLabel}
                      </p>
                      <h2 className="mt-3 text-3xl font-extrabold">
                        {product.title}
                      </h2>
                    </div>
                    <TrackedLink
                      className="hidden min-h-12 shrink-0 items-center gap-2 bg-[var(--primary)] px-5 font-extrabold text-white lg:inline-flex"
                      eventName="product_inquiry_click"
                      eventProperties={{ product_index: index + 1 }}
                      href="/#inquiry"
                    >
                      제품군 문의
                      <ArrowRight aria-hidden="true" size={17} />
                    </TrackedLink>
                  </div>
                  <p className="mt-4 text-base leading-8 text-[var(--sub-text)]">
                    {product.description}
                  </p>
                  <ul className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
                    {product.specs.map((spec) => (
                      <li className="flex items-start gap-2" key={spec}>
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-[var(--primary)]"
                          size={17}
                        />
                        {spec}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-3">
                    <div>
                      <strong className="text-sm">제조사 제공 사양</strong>
                      <p className="mt-1 text-xs leading-5 text-[var(--sub-text)]">
                        모델별 규격·하중 확인
                      </p>
                    </div>
                    <div>
                      <strong className="text-sm">제3자 시험 확인값</strong>
                      <p className="mt-1 text-xs leading-5 text-[var(--sub-text)]">
                        동일 시료 여부 확인
                      </p>
                    </div>
                    <div>
                      <strong className="text-sm">적용 전 확인</strong>
                      <p className="mt-1 text-xs leading-5 text-[var(--sub-text)]">
                        화물·랙·설비 조건
                      </p>
                    </div>
                  </div>
                  <TrackedLink
                    className="mt-7 inline-flex min-h-12 items-center gap-2 bg-[var(--primary)] px-5 font-extrabold text-white lg:hidden"
                    eventName="product_inquiry_click"
                    eventProperties={{ product_index: index + 1 }}
                    href="/#inquiry"
                  >
                    이 제품군 문의
                    <ArrowRight aria-hidden="true" size={17} />
                  </TrackedLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 lg:px-8 lg:py-24" id="comparison">
        <div className="mx-auto max-w-[1200px]">
          <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
            Model Comparison
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">AD · AC · AS 모델 비교</h2>
          <div className="mt-8 hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--primary-deep)] text-white">
                <tr>
                  {["모델", "구조", "대표 규격", "제조사 동하중", "제조사 정하중", "검토 용도"].map(
                    (heading) => (
                      <th className="px-4 py-4" key={heading} scope="col">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {modelSpecs.map((model) => (
                  <tr className="border-b border-[var(--line)]" key={model.model}>
                    <th className="px-4 py-5 font-extrabold" scope="row">
                      {model.model}
                    </th>
                    <td className="px-4 py-5">{model.type}</td>
                    <td className="px-4 py-5">{model.size}</td>
                    <td className="px-4 py-5">{model.dynamicLoad}</td>
                    <td className="px-4 py-5">{model.staticLoad}</td>
                    <td className="px-4 py-5">{model.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 grid gap-4 lg:hidden">
            {modelSpecs.map((model) => (
              <article className="border border-[var(--line)] p-5" key={model.model}>
                <h3 className="text-xl font-extrabold">{model.model}</h3>
                <dl className="mt-4 grid gap-2 text-sm">
                  {[
                    ["구조", model.type],
                    ["대표 규격", model.size],
                    ["제조사 동하중", model.dynamicLoad],
                    ["제조사 정하중", model.staticLoad],
                    ["검토 용도", model.usage],
                  ].map(([label, value]) => (
                    <div className="flex justify-between gap-4" key={label}>
                      <dt className="text-[var(--sub-text)]">{label}</dt>
                      <dd className="text-right font-bold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-[var(--sub-text)]">
            <Info
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[var(--primary)]"
              size={17}
            />
            {modelSpecDisclaimer}
          </p>
        </div>
      </section>

      <section
        className="bg-[var(--primary-deep)] px-5 py-16 text-white lg:px-8 lg:py-24"
        id="selection-guide"
      >
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold)]">
              Selection Guide
            </p>
            <h2 className="mt-3 text-3xl font-extrabold">
              제품보다 먼저 확인할 운용조건
            </h2>
            <p className="mt-4 leading-8 text-white/68">
              화물 형상과 중량, 하중 분포, 적재 방식, 랙 구조와 자동화 설비를
              함께 확인한 뒤 제품군과 규격을 검토합니다.
            </p>
          </div>
          <ol className="grid gap-px bg-white/15 sm:grid-cols-2">
            {[
              "화물 형상·중량",
              "하중 분포·고정 방식",
              "랙·지게차 진입",
              "보관·수출 환경",
            ].map((item, index) => (
              <li className="bg-[var(--primary-deep)] p-5" key={item}>
                <span className="number text-sm text-[var(--accent-gold)]">
                  0{index + 1}
                </span>
                <strong className="mt-4 block">{item}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1200px]">
          <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
            Product Structure & Key Features
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">
            제품 구조 및 주요 특징 소개영상
          </h2>
          <div className="mt-8 w-full max-w-[700px]">
            <ResponsiveVideo
              fallback={cms?.homePage?.companyOverviewVideo}
              poster={cms?.homePage?.companyOverviewPoster}
              title="제품 구조 및 주요 특징 소개영상"
              video1080={cms?.homePage?.companyOverviewVideo1080}
              video720={cms?.homePage?.companyOverviewVideo720}
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-2xl font-extrabold">관련 시험자료</h2>
          <div className="mt-6 grid gap-3">
            {relatedDocuments.map((document, index) => (
              <Link
                className="flex min-h-16 items-center justify-between gap-5 border-b border-[var(--line)] py-3 font-bold"
                href={`/documents#document-${index + 1}`}
                key={document.title}
              >
                <span>{document.title}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="shrink-0 text-[var(--primary)]"
                  size={17}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
