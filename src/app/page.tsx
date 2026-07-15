import AboutSection from "@/components/AboutSection";
import BenefitsSection from "@/components/BenefitsSection";
import CatalogSection from "@/components/CatalogSection";
import DocumentLibrarySection, {
  type DocumentItem,
} from "@/components/DocumentLibrarySection";
import EcoDataSection from "@/components/EcoDataSection";
import ExportReadinessSection from "@/components/ExportReadinessSection";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IndustriesSection from "@/components/IndustriesSection";
import InquirySection from "@/components/InquirySection";
import ManufacturingProcessSection from "@/components/ManufacturingProcessSection";
import OverviewVideoSection from "@/components/OverviewVideoSection";
import PerformanceSection from "@/components/PerformanceSection";
import ProblemSection from "@/components/ProblemSection";
import ProductIntroSection from "@/components/ProductIntroSection";
import ProductLineup from "@/components/ProductLineup";
import TestVideosSection from "@/components/TestVideosSection";
import { documents, industries, products } from "@/lib/constants";
import { getWebsiteContent } from "@/lib/websiteContent";
import { Fragment } from "react";

export const revalidate = 300;

export default async function Home() {
  const cms = await getWebsiteContent();
  const home = cms?.homePage;
  const settings = cms?.siteSettings;
  const completeCmsTestResults = cms?.testResults?.filter(
    (group) =>
      group.reportNumber &&
      group.testDate &&
      group.specimen &&
      group.results?.length > 0 &&
      group.results.every((result) => result.referenceValue && result.judgement),
  );
  const cmsDocuments: DocumentItem[] | undefined = cms?.documents?.map(
    (item) => ({
      title: item.title,
      documentType: item.documentType,
      issuer: item.issuer,
      reportNumber: item.reportNumber,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate || "별도 유효기간 기재 없음",
      relatedProducts: item.relatedProducts?.join(", "),
      language: item.language,
      fileUrl: item.fileUrl || "",
      previewUrl: item.previewUrl,
      thumbnailUrl: item.thumbnailUrl,
      koreanSummary: item.koreanSummary,
    }),
  );
  const visibility = new Map(
    home?.sectionVisibility?.map((item) => [item.section, item.visible]) ?? [],
  );
  const defaultOrder = [
    "hero",
    "risks",
    "overview",
    "process",
    "productOverviewVideo",
    "benefits",
    "verification",
    "performanceVideos",
    "documents",
    "products",
    "preApplication",
    "applications",
    "sustainability",
    "company",
    "companyOverviewVideo",
    "catalog",
    "contact",
  ];
  const storedOrder = home?.sectionOrder?.length
    ? home.sectionOrder
    : defaultOrder;
  const requestedOrder = storedOrder.filter((key) => key !== "benefits");
  const verificationIndex = requestedOrder.indexOf("verification");
  requestedOrder.splice(
    verificationIndex >= 0 ? verificationIndex : 5,
    0,
    "benefits",
  );
  const storedDocumentsIndex = requestedOrder.indexOf("documents");
  if (storedDocumentsIndex >= 0) requestedOrder.splice(storedDocumentsIndex, 1);
  const performanceVideosIndex = requestedOrder.indexOf("performanceVideos");
  const productsIndex = requestedOrder.indexOf("products");
  requestedOrder.splice(
    performanceVideosIndex >= 0
      ? performanceVideosIndex + 1
      : productsIndex >= 0
        ? productsIndex
        : 8,
    0,
    "documents",
  );
  const orderMap = new Map(requestedOrder.map((key, index) => [key, index]));
  const sections = [
    {
      key: "hero",
      element: (
        <HeroSection
          desktopImage={home?.heroDesktopImage}
          mobileImage={home?.heroMobileImage}
        />
      ),
    },
    { key: "risks", element: <ProblemSection /> },
    { key: "overview", element: <ProductIntroSection imageUrl={home?.overviewImage} /> },
    {
      key: "process",
      element: <ManufacturingProcessSection />,
    },
    {
      key: "productOverviewVideo",
      element: (
        <OverviewVideoSection
          description="압축성형 목재 팔레트의 원료, 제조방식, 구조, 제품군과 활용 방향을 소개하는 제조사 제공 영상입니다."
          disclaimer="본 영상은 제조사가 제작한 제품 홍보자료입니다. 영상 내 성능 및 환경 관련 표현은 제품 모델과 조건에 따라 달라질 수 있으며, 공식 수치는 별도의 시험성적서와 제품 탄소발자국 검증자료를 참조하십시오."
          eyebrow="Product Overview Video"
          fieldName="homePage.productOverviewVideo"
          id="product-overview-video"
          posterUrl={home?.productOverviewPoster}
          title="제품 구조 및 특징 소개영상"
          videoUrl={home?.productOverviewVideo}
        />
      ),
    },
    {
      key: "verification",
      element: (
        <PerformanceSection
          groups={completeCmsTestResults?.length ? completeCmsTestResults : undefined}
          reportThumbnailUrl={home?.verificationReportThumbnail}
          reportFileUrl={home?.verificationReportFile}
          testImageUrl={home?.verificationImage}
        />
      ),
    },
    { key: "performanceVideos", element: <TestVideosSection videos={cms?.performanceVideos} /> },
    { key: "benefits", element: <BenefitsSection /> },
    {
      key: "products",
      element: <ProductLineup items={cms?.products?.length ? cms.products : products} />,
    },
    { key: "preApplication", element: <ExportReadinessSection /> },
    {
      key: "applications",
      element: (
        <IndustriesSection
          items={cms?.industries?.length ? cms.industries : industries}
        />
      ),
    },
    {
      key: "sustainability",
      element: (
        <EcoDataSection
          statementThumbnailUrl={home?.sustainabilityStatementThumbnail}
          statementFileUrl={home?.sustainabilityStatementFile}
        />
      ),
    },
    {
      key: "documents",
      element: (
        <DocumentLibrarySection
          items={cmsDocuments?.length ? cmsDocuments : documents}
        />
      ),
    },
    { key: "company", element: <AboutSection factoryImageUrl={cms?.factoryImage} /> },
    {
      key: "companyOverviewVideo",
      element: (
        <OverviewVideoSection
          description="ADS의 회사 소개, 생산설비, 제품 개발, 맞춤 설계와 해외사업 방향을 소개하는 제조사 제공 영상입니다."
          disclaimer="본 영상은 제조사가 제작한 홍보자료입니다. 영상 내 일부 수치와 표현은 회사 제공자료 또는 홍보 표현을 포함하며, 제품의 공식 성능과 시험 결과는 별도의 시험성적서 및 검증자료를 기준으로 확인하십시오."
          eyebrow="Company and Manufacturing Overview"
          fieldName="homePage.companyOverviewVideo"
          id="company-overview-video"
          muted
          posterUrl={home?.companyOverviewPoster}
          title="회사·생산 및 기술 소개영상"
          videoUrl={home?.companyOverviewVideo}
        />
      ),
    },
    { key: "catalog", element: <CatalogSection catalog={cms?.catalog} /> },
    {
      key: "contact",
      element: (
        <InquirySection
          phoneHref={settings?.phone ? `tel:${settings.phone.replace(/[^+\d]/g, "")}` : ""}
        />
      ),
    },
  ]
    .filter((section) => visibility.get(section.key) !== false)
    .sort(
      (left, right) =>
        (orderMap.get(left.key) ?? defaultOrder.indexOf(left.key)) -
        (orderMap.get(right.key) ?? defaultOrder.indexOf(right.key)),
    );

  return (
    <>
      <Header brandName={settings?.brandName} />
      <main>
        {sections.map((section) => (
          <Fragment key={section.key}>{section.element}</Fragment>
        ))}
      </main>
      <FloatingContactButtons />
      <Footer hasCatalog={Boolean(cms?.catalog?.fileUrl)} settings={settings} />
    </>
  );
}
