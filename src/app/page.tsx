import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Check,
  ClipboardCheck,
  Layers3,
  PackageCheck,
} from "lucide-react";
import ApplicationGuide from "@/components/ApplicationGuide";
import CatalogDownload from "@/components/CatalogDownload";
import CustomerApplicationsGrid from "@/components/CustomerApplicationsGrid";
import InquirySection from "@/components/InquirySection";
import SourceBadge from "@/components/SourceBadge";
import TrackedLink from "@/components/TrackedLink";
import {
  benefits,
  companyStats,
  documents as fallbackDocuments,
  products as fallbackProducts,
  testGroups,
} from "@/lib/constants";
import { getWebsiteContent } from "@/lib/websiteContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "아델슨 코리아 | MDI 압축성형 목재 팔레트",
  description:
    "제품군, 실제 적용 검토, 제3자 성능시험과 기술자료를 한곳에서 확인하는 아델슨 코리아 공식 웹사이트",
  alternates: { canonical: "/" },
};

const defaultOrder = [
  "hero",
  "proof",
  "products",
  "benefits",
  "customerApplications",
  "verification",
  "preApplication",
  "company",
  "documents",
  "contact",
];

function SectionIntro({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p
        className={`en text-xs font-bold uppercase tracking-[0.18em] ${
          dark ? "text-[var(--accent-gold)]" : "text-[var(--accent-gold-dark)]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl font-extrabold leading-tight lg:text-[40px] ${
          dark ? "text-white" : "text-[var(--primary-deep)]"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-8 ${
            dark ? "text-white/68" : "text-[var(--sub-text)]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default async function Home() {
  const cms = await getWebsiteContent();
  const settings = cms?.siteSettings;
  const products = (
    cms?.products?.length ? cms.products : fallbackProducts
  ).map((product) => ({
    ...product,
    imageUrl:
      "imageUrl" in product && typeof product.imageUrl === "string"
        ? product.imageUrl
        : undefined,
  }));
  const documents = cms?.documents?.length
    ? cms.documents
    : fallbackDocuments.map((item) => ({
        ...item,
        relatedProducts: [item.relatedProducts],
      }));
  const visibility = new Map(
    cms?.homePage?.sectionVisibility?.map((item) => [
      item.section,
      item.visible,
    ]) || [],
  );
  const requestedOrder = (
    cms?.homePage?.sectionOrder?.length
      ? cms.homePage.sectionOrder
      : defaultOrder
  )
    .map((key) => {
      const legacyMap: Record<string, string> = {
        productOverview: "products",
        productOverviewVideo: "products",
        performanceVideos: "verification",
        applications: "preApplication",
        sustainability: "verification",
      };
      return legacyMap[key] || key;
    })
    .filter((key, index, values) => values.indexOf(key) === index);
  const order = [
    ...requestedOrder.filter((key) => defaultOrder.includes(key)),
    ...defaultOrder.filter((key) => !requestedOrder.includes(key)),
  ];

  const heroImage =
    cms?.homePage?.heroDesktopImage || cms?.homePage?.overviewImage;
  const customerApplications = cms?.customerApplications || [];

  const sections: Record<string, React.ReactNode> = {
    hero: (
      <section
        className="relative overflow-hidden bg-[var(--background)] px-5 py-12 lg:px-8"
        id="hero"
      >
        <div className="mx-auto grid max-w-[1240px] gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
          <div className="relative z-10">
            <p className="en text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-gold-dark)]">
              Molded Wood Pallet Solutions
            </p>
            <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-[var(--primary-deep)]">
              <span className="block sm:whitespace-nowrap">
                수출 포장은 더 간편하게,
              </span>
              <span className="block sm:whitespace-nowrap">
                보관 공간은 더 효율적으로,
              </span>
              <span className="block text-[var(--primary)] sm:whitespace-nowrap">
                물류 운영은 더 합리적으로.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--sub-text)]">
              제3자 시험자료와 실제 운용조건을 바탕으로 검토하는 MDI
              압축성형 산업용 목재 팔레트
            </p>
            <p className="mt-3 max-w-xl border-l-2 border-[var(--accent-gold)] pl-4 text-[13px] leading-6 text-[var(--sub-text)]">
              목적국 규정, 보관 공간, 작업 안전과 총 운영조건을 함께
              검토합니다.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                className="inline-flex min-h-13 items-center justify-center gap-2 bg-[var(--primary-dark)] px-6 font-extrabold text-white hover:bg-[var(--primary)]"
                eventName="hero_product_click"
                href="/products"
              >
                제품 라인업 보기
                <ArrowRight aria-hidden="true" size={18} />
              </TrackedLink>
              <TrackedLink
                className="inline-flex min-h-13 items-center justify-center border border-[var(--primary-dark)] bg-white px-6 font-extrabold text-[var(--primary-dark)] hover:bg-[var(--muted-surface)]"
                eventName="hero_inquiry_click"
                href="/#inquiry"
              >
                견적 및 문의
              </TrackedLink>
            </div>
          </div>
          <div className="relative min-h-[320px] lg:min-h-[420px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_0%,#eef1e9_65%,transparent_66%)]" />
            {heroImage ? (
              <Image
                alt="아델슨 MDI 압축성형 목재 팔레트"
                className="relative z-10 h-full min-h-[320px] w-full object-contain p-1 lg:min-h-[420px] lg:p-0"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 46vw"
                src={heroImage}
              />
            ) : (
              <div className="relative z-10 flex min-h-[320px] items-center justify-center border border-[var(--line)] bg-white text-sm text-[var(--sub-text)]">
                CMS 대표 제품 이미지
              </div>
            )}
          </div>
        </div>
      </section>
    ),
    proof: (
      <section
        aria-label="제3자 검증 핵심 수치"
        className="border-y border-[var(--sub-sage)] bg-[var(--sub-mint)] px-5 py-7 lg:px-8"
      >
        <div className="mx-auto grid max-w-[1240px] gap-6 lg:grid-cols-[1fr_1fr_1.35fr]">
          {[
            ["2,818kg", "포크 인양시험"],
            ["8,447kg", "상판 집중하중"],
          ].map(([value, label]) => (
            <div
              className="flex min-h-28 flex-col justify-center border-l-2 border-[var(--primary)] pl-5"
              key={label}
            >
              <p className="number text-3xl font-bold text-[var(--primary-deep)]">
                {value}
              </p>
              <p className="mt-1 text-sm font-bold">{label}</p>
            </div>
          ))}
          <div className="text-sm leading-6 text-[var(--sub-text)]">
            <SourceBadge kind="third-party" />
            <p className="mt-3 font-bold text-[var(--primary-deep)]">
              국가포장제품품질검사센터 · TJA20251108-0015
            </p>
            <p>압축성형 팔레트 1100 × 1100 × 130mm · 제출 시료 기준</p>
            <TrackedLink
              className="mt-2 inline-flex items-center gap-1 font-extrabold text-[var(--primary)] underline underline-offset-4"
              eventName="performance_detail_view"
              eventProperties={{ source: "proof_bar" }}
              href="/performance"
            >
              성능 시험 상세 보기
              <ArrowRight aria-hidden="true" size={15} />
            </TrackedLink>
          </div>
        </div>
      </section>
    ),
    products: (
      <section className="px-5 py-16 lg:px-8 lg:py-24" id="product-lineup">
        <div className="mx-auto max-w-[1240px]">
          <SectionIntro
            eyebrow="Product Lineup"
            title="화물과 운용조건에 맞춘 제품 라인업"
            description="메인에서는 제품군의 역할만 빠르게 확인하고, 상세 사양과 관련 시험자료는 제품 페이지에서 검토할 수 있습니다."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product, index) => (
              <article
                className="group flex min-h-full flex-col border border-[var(--line)] bg-white"
                id={`product-${index + 1}`}
                key={product.title}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#d8d8d8]">
                  {product.imageUrl ? (
                    <Image
                      alt={product.title}
                      className="object-contain transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
                      src={product.imageUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Box
                        aria-hidden="true"
                        className="text-[var(--sub-sage)]"
                        size={42}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl font-extrabold">{product.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[var(--sub-text)]">
                    {product.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.specs.slice(0, 2).map((spec) => (
                      <span
                        className="bg-[var(--muted-surface)] px-2.5 py-1.5 text-xs font-bold text-[var(--primary-dark)]"
                        key={spec}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                  <TrackedLink
                    className="mt-6 inline-flex min-h-11 items-center gap-2 border-t border-[var(--line)] pt-4 text-sm font-extrabold text-[var(--primary)]"
                    eventName="product_view"
                    eventProperties={{ product_index: index + 1 }}
                    href={`/products#lineup-${index + 1}`}
                  >
                    상세 보기
                    <ArrowRight aria-hidden="true" size={16} />
                  </TrackedLink>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 items-stretch gap-2 border-t border-[var(--line)] pt-7 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-[var(--primary)] px-3 text-center text-sm leading-5 font-extrabold text-[var(--primary)] sm:w-auto sm:px-5 sm:text-base"
              href="/products#comparison"
            >
              전체 제품 비교하기
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <div className="min-w-0 [&>div]:h-full [&_a]:h-full [&_a]:w-full [&_a]:px-3 [&_a]:text-center [&_a]:text-sm [&_a]:leading-5 sm:[&>div]:h-auto sm:[&_a]:h-auto sm:[&_a]:w-auto sm:[&_a]:px-5 sm:[&_a]:text-base">
              <CatalogDownload location="home_product_lineup" />
            </div>
          </div>
        </div>
      </section>
    ),
    benefits: (
      <section className="bg-white px-5 py-16 lg:px-8 lg:py-24" id="benefits">
        <div className="mx-auto max-w-[1200px]">
          <SectionIntro
            eyebrow="Review Priorities"
            title="구매 검토에서 먼저 확인할 세 가지"
            description="제품 단가 하나가 아니라 수출 포장 관리, 중첩 보관과 실제 운용조건을 함께 살펴봅니다."
          />
          <div className="mt-10 grid gap-px bg-[var(--line)] lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const icons = [PackageCheck, Layers3, ClipboardCheck];
              const Icon = icons[index];
              return (
                <article className="bg-white p-6 lg:p-8" key={benefit.title}>
                  <Icon
                    aria-hidden="true"
                    className="text-[var(--primary)]"
                    size={28}
                  />
                  <p className="en mt-8 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-gold-dark)]">
                    {benefit.eyebrow}
                  </p>
                  <h3 className="mt-2 text-xl font-extrabold">
                    {
                      [
                        "수출 포장 관리",
                        "중첩 보관 효율",
                        "물류 운영 검토",
                      ][index]
                    }
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--sub-text)]">
                    {benefit.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    ),
    customerApplications: (
      <section
        className="bg-[var(--muted-surface)] px-5 py-16 lg:px-8 lg:py-24"
        id="customer-applications"
      >
        <div className="mx-auto max-w-[1200px]">
          <SectionIntro
            eyebrow="Customer Applications"
            title="실제 화물·운용 환경 적용 사례"
            description="제조사 제공 고객 적용 자료를 바탕으로 화물 형태와 운용 환경을 소개합니다. 문서에 기재된 중량은 개별 사례의 참고정보이며, 실제 적용 가능 여부는 제품 규격, 하중 분포, 보관 방식과 사용설비를 함께 검토해야 합니다."
          />
          <div className="mt-10">
            <CustomerApplicationsGrid items={customerApplications} />
          </div>
        </div>
      </section>
    ),
    verification: (
      <section className="bg-white px-5 py-16 lg:px-8 lg:py-24" id="performance">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
            <SectionIntro
              eyebrow="Verified Performance"
              title="시험 보고서별 성능 검증 요약"
              description="제조사 제공 사양과 섞지 않고, 제출된 시료에 대한 제3자 시험 결과만 보고서 단위로 표시합니다."
            />
            <Link
              className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start border border-[var(--primary)] px-5 font-extrabold text-[var(--primary)]"
              href="/performance"
            >
              모든 시험 상세 보기
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {testGroups.map((group, groupIndex) => (
              <article
                className="border border-[var(--line)] bg-[var(--background)] p-6 lg:p-8"
                key={group.id}
              >
                <SourceBadge kind="third-party" />
                <h3 className="mt-5 text-2xl font-extrabold">{group.label}</h3>
                <dl className="mt-4 grid gap-1 text-sm leading-6 text-[var(--sub-text)]">
                  <div>
                    <dt className="inline font-bold text-[var(--primary-deep)]">
                      시험기관{" "}
                    </dt>
                    <dd className="inline">{group.organization}</dd>
                  </div>
                  <div>
                    <dt className="inline font-bold text-[var(--primary-deep)]">
                      보고서{" "}
                    </dt>
                    <dd className="inline">{group.reportNumber}</dd>
                  </div>
                  <div>
                    <dt className="inline font-bold text-[var(--primary-deep)]">
                      시료{" "}
                    </dt>
                    <dd className="inline">{group.specimen}</dd>
                  </div>
                </dl>
                <div className="mt-6 grid gap-px bg-[var(--line)] sm:grid-cols-3">
                  {group.results
                    .filter((result) =>
                      group.id === "national-2025"
                        ? [
                            "포크 인양시험",
                            "상판 집중하중",
                            "지지다리 압축성능",
                          ].includes(result.name)
                        : [
                            "포크 인양성능",
                            "상판 집중하중",
                            "내부결합강도",
                          ].includes(result.name),
                    )
                    .map((result) => (
                      <div className="bg-white p-4" key={result.name}>
                        <p className="number text-xl font-bold text-[var(--primary)]">
                          {result.value}
                        </p>
                        <p className="mt-2 text-xs font-bold">{result.name}</p>
                      </div>
                    ))}
                </div>
                <Link
                  className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--primary)] underline underline-offset-4"
                  href={`/documents#document-${groupIndex + 1}`}
                >
                  원문 시험자료 보기
                  <ArrowRight aria-hidden="true" size={15} />
                </Link>
              </article>
            ))}
          </div>
          <article className="mt-5 border border-[var(--line)] bg-white p-5">
            <h3 className="font-bold text-[var(--text)]">
              포름알데히드 방출량 시험
            </h3>
            <p className="number mt-2 text-2xl font-bold text-[var(--primary)]">
              0.9mg/L
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">
              방법 검출한계 0.1mg/L · 시험방법 GB/T 17657-2022 · 보고서
              TBK20260318Lab10101-1A · 2026년 4월 2일 발급
            </p>
          </article>
        </div>
      </section>
    ),
    preApplication: (
      <section
        className="bg-[var(--primary-deep)] px-5 py-16 lg:px-8 lg:py-24"
        id="application-review"
      >
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="lg:[&_h2]:whitespace-nowrap">
            <SectionIntro
              dark
              eyebrow="Application Review"
              title="우리 환경에 적용하기 전 확인할 조건"
              description="몇 가지 조건을 선택하면 상담에 필요한 항목을 미리 입력해드립니다. 선택 결과가 제품 적합성을 자동 확정하지는 않습니다."
            />
            <div className="mt-8">
              <ApplicationGuide />
            </div>
          </div>
          <div className="border-l border-white/16 pl-0 lg:pl-12">
            <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold)]">
              Review Checklist
            </p>
            <h3 className="mt-3 text-2xl font-extrabold text-white">
              핵심 확인사항
            </h3>
            <ul className="mt-7 grid gap-2 sm:grid-cols-2">
              {[
                "화물 형상과 중량",
                "하중 분포",
                "적재 방식",
                "랙 구조",
                "지게차 진입 방향",
                "자동화 설비",
                "보관 환경",
                "목적국 규정",
                "예상 사용수량",
              ].map((item) => (
                <li
                  className="flex min-h-14 items-center gap-3 border border-white/12 bg-white/[0.04] px-4 text-sm font-bold text-white/78"
                  key={item}
                >
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[var(--accent-gold)]"
                    size={17}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    ),
    company: (
      <section className="px-5 py-16 lg:px-8 lg:py-24" id="company">
        <div className="mx-auto max-w-[1200px]">
          <div>
            <SectionIntro
              eyebrow="Company & Capacity"
              title="산업 경험을 바탕으로 한 생산 기반"
              description="제품 적용 검토부터 생산 역량까지 회사 제공 자료를 기준으로 확인할 수 있습니다."
            />
            <div className="mt-8 grid grid-cols-2 gap-px bg-[var(--line)]">
              {companyStats.map((stat) => (
                <div className="bg-white p-4" key={stat.label}>
                  <p className="number text-2xl font-bold text-[var(--primary)]">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--sub-text)]">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
            <Link
              className="mt-7 inline-flex min-h-12 items-center gap-2 border border-[var(--primary)] px-5 font-extrabold text-[var(--primary)]"
              href="/company"
            >
              회사 및 생산역량 보기
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>
      </section>
    ),
    documents: (
      <section className="bg-white px-5 py-16 lg:px-8 lg:py-24" id="documents">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
            <SectionIntro
              eyebrow="Technical Documents"
              title="검토 단계에 맞는 기술자료"
              description="핵심 문서만 간결하게 확인하고, 한국어 요약과 상세 시험표는 자료 페이지에서 볼 수 있습니다."
            />
            <Link
              className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start border border-[var(--primary)] px-5 font-extrabold text-[var(--primary)]"
              href="/documents"
            >
              기술자료 전체 보기
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
          <div className="mt-10 border-t-2 border-[var(--primary-deep)]">
            {documents.slice(0, 4).map((document, index) => (
              <article
                className="grid gap-3 border-b border-[var(--line)] py-5 md:grid-cols-[1.5fr_0.7fr_0.8fr_auto] md:items-center"
                key={document.title}
              >
                <div>
                  <p className="text-xs font-bold text-[var(--accent-gold-dark)]">
                    {document.documentType}
                  </p>
                  <h3 className="mt-1 font-extrabold">{document.title}</h3>
                </div>
                <p className="text-sm text-[var(--sub-text)]">
                  {document.issuer}
                </p>
                <p className="text-sm text-[var(--sub-text)]">
                  {document.issueDate || "발급일 원문 참조"}
                </p>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-[var(--primary)]"
                  href={`/documents#document-${index + 1}`}
                >
                  원문 보기
                  <ArrowRight aria-hidden="true" size={15} />
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <CatalogDownload location="home_documents" />
          </div>
        </div>
      </section>
    ),
    contact: (
      <InquirySection
        email={settings?.primaryContactEmail || settings?.email}
        phone={settings?.primaryPhone || settings?.phone}
      />
    ),
  };

  return (
    <main id="main-content">
      {order.map((key) =>
        visibility.get(key) === false ? null : (
          <div key={key}>{sections[key]}</div>
        ),
      )}
    </main>
  );
}
