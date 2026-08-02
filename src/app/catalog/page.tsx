import type { Metadata } from "next";
import InquirySection from "@/components/InquirySection";
import TestVideosSection from "@/components/TestVideosSection";
import CatalogExperience from "@/components/catalog/CatalogExperience";
import {
  AdvantagesSection,
  ApplicationCheckSection,
  ApplicationReviewSection,
  ApplicationsSection,
  CarbonFootprintSection,
  CatalogGuide,
  CatalogHero,
  CompanySection,
  ComparisonSection,
  DocumentsSection,
  FormaldehydeSection,
  LineupSection,
  ManufacturingSection,
  MarketSection,
  ProductOverviewSection,
  RndQualitySection,
  SpecificationsSection,
  StructureSection,
  Test2025Section,
  Test2026Section,
  TestNavigation,
} from "@/components/catalog/CatalogSections";
import { catalogDocuments } from "@/data/catalog/content";
import { siteConfig } from "@/data/catalog/siteConfig";
import type {
  CatalogApplicationCase,
  CatalogDocument,
} from "@/data/catalog/types";
import { getWebsiteContent } from "@/lib/websiteContent";

export const revalidate = 300;

const title = "압축성형 목재 팔레트 제품·성능·사양 | 아델슨 코리아";
const description =
  "아델슨 코리아 압축성형 목재 팔레트의 제품 구조, 시험결과, 모델 사양, 적용 사례와 견적 문의 정보를 확인하세요.";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getWebsiteContent();
  const representativeImage =
    cms?.products?.find((product) => product.imageUrl)?.imageUrl ||
    cms?.homePage?.overviewImage ||
    cms?.homePage?.heroDesktopImage ||
    "/og.png";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/catalog" },
    openGraph: {
      title,
      description,
      locale: "ko_KR",
      type: "website",
      images: [{ url: representativeImage, alt: "아델슨 압축성형 목재 팔레트" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [representativeImage],
    },
  };
}

function applicationCategory(cargoType: string, environment: string): CatalogApplicationCase["category"] {
  const source = `${cargoType} ${environment}`;
  if (/톤백|포대/.test(source)) return "톤백·포대";
  if (/드럼|용기/.test(source)) return "드럼·용기";
  if (/박스/.test(source)) return "박스";
  if (/랙|창고/.test(source)) return "창고·랙";
  if (/컨테이너|운송|차량/.test(source)) return "운송";
  return "산업부품";
}

export default async function CatalogPage() {
  const cms = await getWebsiteContent();
  const productImages = (cms?.products || []).map((product) => product.imageUrl);
  const heroImage =
    productImages.find(Boolean) ||
    cms?.homePage?.overviewImage ||
    cms?.homePage?.heroDesktopImage;

  const cases: CatalogApplicationCase[] = (cms?.customerApplications || []).map(
    (item) => ({
      id: `case-${item.sortOrder + 1}`,
      title: item.title || "적용 사례",
      companyName: item.customerName,
      companyNameVisible: item.showCustomerName,
      cargoType: item.cargoType,
      environment: item.operatingEnvironment,
      weightText: item.documentedWeight || "중량 미기재",
      imageUrl: item.imageUrl,
      imageAlt: `${item.title || "압축성형 목재 팔레트"} 적용 사진`,
      sourceType: "MANUFACTURER_CASE",
      sourceDocument: item.sourcePage,
      publicApproved: item.publicUseApproved,
      visible: item.isVisible,
      category: applicationCategory(item.cargoType, item.operatingEnvironment),
    }),
  );

  const documents: CatalogDocument[] = catalogDocuments.map((document, index) => {
    const cmsDocument = cms?.documents?.[index];
    return {
      ...document,
      thumbnailUrl: cmsDocument?.thumbnailUrl,
      pdfUrl: cmsDocument?.fileUrl,
      // 공개 승인 값이 현재 CMS에 없으므로 승인 전까지 문의 방식으로 유지합니다.
      publicDownload: false,
    };
  });

  const videos = (cms?.performanceVideos || []).filter(
    (video) => video.videoUrl && video.title && video.description,
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "아델슨 압축성형 목재 팔레트",
    brand: { "@type": "Brand", name: "아델슨 코리아" },
    description,
    manufacturer: { "@type": "Organization", name: "아델슨 코리아" },
  };

  return (
    <main className="catalog-page" id="main-content" tabIndex={-1}>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <CatalogExperience />
      <CatalogHero imageUrl={heroImage} />
      <CatalogGuide />
      <MarketSection />
      <ProductOverviewSection imageUrl={cms?.homePage?.overviewImage || heroImage} />
      <AdvantagesSection />
      <ComparisonSection moldedImageUrl={heroImage} />
      <StructureSection imageUrl={cms?.homePage?.overviewImage || heroImage} />
      <ManufacturingSection />
      <TestNavigation />
      <TestVideosSection catalogMode videos={videos} />
      <Test2025Section />
      <Test2026Section />
      <FormaldehydeSection />
      <CarbonFootprintSection />
      <LineupSection imageUrls={productImages} />
      <SpecificationsSection />
      <ApplicationCheckSection />
      <ApplicationsSection cases={cases} />
      <CompanySection factoryImage={cms?.factoryImage} />
      <RndQualitySection />
      <DocumentsSection documents={documents} />
      <ApplicationReviewSection />
      <InquirySection
        catalogMode
        email={siteConfig.contact.email}
        phone={siteConfig.contact.phoneDisplay}
        sectionId="contact"
      />
    </main>
  );
}
