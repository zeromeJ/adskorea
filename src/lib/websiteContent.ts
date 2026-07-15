import { hasWebsiteContentModels, prisma } from "@/lib/prisma";
import {
  documents as fallbackDocuments,
  performanceVideoFallbacks,
  products as fallbackProducts,
} from "@/lib/constants";

export type CmsSiteContent = {
  siteSettings?: {
    brandName?: string;
    brandNameEn?: string;
    legalCompanyName?: string;
    manufacturerName?: string;
    salesCompanyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
  };
  homePage?: {
    heroDesktopImage?: string;
    heroMobileImage?: string;
    overviewImage?: string;
    processVideo?: string;
    processPoster?: string;
    productOverviewVideo?: string;
    productOverviewPoster?: string;
    companyOverviewVideo?: string;
    companyOverviewPoster?: string;
    verificationImage?: string;
    verificationReportThumbnail?: string;
    verificationReportFile?: string;
    sustainabilityStatementThumbnail?: string;
    sustainabilityStatementFile?: string;
    sectionOrder?: string[];
    sectionVisibility?: Array<{ section: string; visible: boolean }>;
  };
  products?: Array<{
    title: string;
    streamId?: string;
    englishLabel: string;
    description: string;
    specs: string[];
    mediaField: string;
    imageUrl?: string;
    series?: string;
    sizes?: string[];
    ratedDynamicLoad?: string;
    ratedStaticLoad?: string;
    disclaimer?: string;
    relatedTests?: string[];
  }>;
  testResults?: Array<{
    id: string;
    label: string;
    organization: string;
    classification: string;
    reportNumber: string;
    issueDate?: string;
    testDate: string;
    specimen: string;
    results: Array<{ name: string; value: string; referenceValue?: string; judgement?: string }>;
    reportFileUrl?: string;
  }>;
  industries?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  performanceVideos?: Array<{
    title: string;
    titleEn?: string;
    category?: string;
    durationSeconds?: number;
    streamId?: string;
    videoUrl?: string;
    poster?: string;
    description?: string;
    disclaimer?: string;
    hasRelatedReports?: boolean;
  }>;
  documents?: Array<{
    title: string;
    documentType: string;
    issuer: string;
    reportNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    relatedProducts?: string[];
    language: string;
    fileUrl?: string;
    translatedFileUrl?: string;
    previewUrl?: string;
    publicDownload?: boolean;
    publicPreview?: boolean;
    previewAvailable?: boolean;
    summary?: string;
    thumbnailUrl?: string;
  }>;
  factoryImage?: string;
  catalog?: {
    title: string;
    language: string;
    version: string;
    pages: string;
    updatedAt: string;
    fileSize: string;
    thumbnailUrl?: string;
    fileUrl?: string;
  };
};

export async function getWebsiteContent(): Promise<CmsSiteContent | null> {
  // Prisma 스키마 변경 직후 개발 서버가 구형 Client를 메모리에 들고
  // 있어도 공개 홈페이지는 코드 기본값으로 정상 렌더링한다.
  if (!hasWebsiteContentModels()) return null;

  try {
    const sections = await prisma.websiteSection.findMany({
      include: { assets: { where: { published: true }, orderBy: { sortOrder: "asc" } } },
    });
    if (sections.length === 0) return null;
    const byKey = new Map(sections.map((section) => [section.key, section]));
    const assets = (key: string) => byKey.get(key)?.assets ?? [];
    const asset = (section: string, itemKey: string) =>
      assets(section).find((item) => item.itemKey === itemKey)?.url ?? undefined;
    const assetRecord = (section: string, itemKey: string) =>
      assets(section).find((item) => item.itemKey === itemKey);
    const assetThumbnail = (section: string, itemKey: string) => {
      const metadata = assetRecord(section, itemKey)?.metadata;
      if (!metadata || Array.isArray(metadata) || typeof metadata !== "object") return undefined;
      const value = (metadata as Record<string, unknown>).thumbnailUrl;
      return typeof value === "string" ? value : undefined;
    };
    const assetWithLegacy = (
      section: string,
      itemKey: string,
      legacySection: string,
      legacyItemKey = itemKey,
    ) => asset(section, itemKey) ?? asset(legacySection, legacyItemKey);
    const settings = (byKey.get("site-settings")?.data ?? {}) as CmsSiteContent["siteSettings"];
    const videoData = (byKey.get("intro-videos")?.data ?? {}) as Record<string, string>;
    const currentProductImages = assets("product-lineup");
    const productImages = new Map(
      (currentProductImages.length
        ? currentProductImages
        : assets("product-images")
      ).map((item) => [item.itemKey, item.url]),
    );
    const productKeys = ["singleDeck", "doubleDeck", "threeRunner", "custom"];
    const mappedProducts = fallbackProducts.map((item, index) => ({
      ...item,
      imageUrl: productImages.get(productKeys[index]) ?? undefined,
    }));
    const performanceData = byKey.get("performance")?.data;
    const storedDocuments =
      performanceData &&
      !Array.isArray(performanceData) &&
      typeof performanceData === "object" &&
      Array.isArray((performanceData as Record<string, unknown>).documents)
        ? ((performanceData as Record<string, unknown>).documents as unknown[])
        : [];
    const documentDetails = (index: number) => {
      const value = storedDocuments[index];
      return value && !Array.isArray(value) && typeof value === "object"
        ? (value as Record<string, unknown>)
        : {};
    };
    const documentText = (
      details: Record<string, unknown>,
      key: string,
      fallback?: string,
    ) => (typeof details[key] === "string" ? details[key] as string : fallback);
    return {
      siteSettings: settings,
      homePage: {
        heroDesktopImage: assetWithLegacy("home", "heroDesktop", "main-images"),
        heroMobileImage: assetWithLegacy("home", "heroMobile", "main-images"),
        overviewImage: assetWithLegacy("product-overview", "overview", "main-images"),
        verificationImage: assetWithLegacy("performance", "verification", "main-images"),
        verificationReportThumbnail: assetWithLegacy("performance", "verificationReport", "main-images") ?? assetThumbnail("performance", "verificationReportFile"),
        verificationReportFile: asset("performance", "verificationReportFile"),
        sustainabilityStatementThumbnail: assetWithLegacy("environment", "carbonStatement", "main-images") ?? assetThumbnail("environment", "carbonStatementFile"),
        sustainabilityStatementFile: asset("environment", "carbonStatementFile"),
        productOverviewVideo: asset("product-overview", "productOverviewVideo") ?? videoData.productOverviewVideo,
        productOverviewPoster: assetWithLegacy("product-overview", "productOverviewPoster", "intro-videos"),
        companyOverviewVideo: asset("company", "companyOverviewVideo") ?? videoData.companyOverviewVideo,
        companyOverviewPoster: assetWithLegacy("company", "companyOverviewPoster", "intro-videos"),
        processVideo: asset("product-overview", "processVideo") ?? videoData.processVideo,
        processPoster: assetWithLegacy("product-overview", "processPoster", "intro-videos"),
      },
      products: mappedProducts,
      performanceVideos: performanceVideoFallbacks.map((video, index) => ({
        ...video,
        videoUrl: asset("performance", `video${index + 1}File`),
        poster: asset("performance", `video${index + 1}`),
      })),
      documents: fallbackDocuments.map((document, index) => {
        const details = documentDetails(index);
        const relatedProducts = documentText(
          details,
          "relatedProducts",
          document.relatedProducts,
        );
        return {
          ...document,
          title: documentText(details, "title", document.title) ?? document.title,
          documentType:
            documentText(details, "documentType", document.documentType) ??
            document.documentType,
          issuer:
            documentText(details, "issuer", document.issuer) ?? document.issuer,
          reportNumber: documentText(
            details,
            "reportNumber",
            document.reportNumber,
          ),
          issueDate: documentText(details, "issueDate", document.issueDate),
          expiryDate: documentText(details, "expiryDate", document.expiryDate),
          relatedProducts: relatedProducts ? [relatedProducts] : [],
          language:
            documentText(details, "language", document.language) ??
            document.language,
          summary: documentText(details, "summary", document.summary),
          fileUrl: asset("performance", `document${index + 1}File`) ?? "",
          translatedFileUrl:
            asset("performance", `document${index + 1}TranslatedFile`) ?? "",
          previewUrl: asset("performance", `document${index + 1}File`) ?? "",
          thumbnailUrl:
            asset("performance", `document${index + 1}`) ??
            assetThumbnail("performance", `document${index + 1}File`),
          publicDownload: Boolean(
            asset("performance", `document${index + 1}File`),
          ),
          previewAvailable: Boolean(
            asset("performance", `document${index + 1}File`),
          ),
        };
      }),
      factoryImage: asset("company", "factory"),
      catalog: asset("company", "catalogFile") ? {
        title: "ADS Korea 제품 카탈로그",
        language: "한국어",
        version: "최신본",
        pages: "PDF",
        updatedAt: "최신 등록본",
        fileSize: "",
        thumbnailUrl: asset("company", "catalogCover") ?? assetThumbnail("company", "catalogFile"),
        fileUrl: asset("company", "catalogFile"),
      } : undefined,
    };
  } catch (error) {
    console.warn("Website content DB fetch failed; using fallback content.", error);
    return null;
  }
}
