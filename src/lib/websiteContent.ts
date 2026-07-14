import { prisma } from "@/lib/prisma";
import { products as fallbackProducts } from "@/lib/constants";

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
    sustainabilityStatementThumbnail?: string;
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
    previewUrl?: string;
    publicDownload?: boolean;
    publicPreview?: boolean;
    previewAvailable?: boolean;
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
  try {
    const sections = await prisma.websiteSection.findMany({
      include: { assets: { where: { published: true }, orderBy: { sortOrder: "asc" } } },
    });
    if (sections.length === 0) return null;
    const byKey = new Map(sections.map((section) => [section.key, section]));
    const assets = (key: string) => byKey.get(key)?.assets ?? [];
    const asset = (section: string, itemKey: string) =>
      assets(section).find((item) => item.itemKey === itemKey)?.url ?? undefined;
    const settings = (byKey.get("site-settings")?.data ?? {}) as CmsSiteContent["siteSettings"];
    const videoData = (byKey.get("intro-videos")?.data ?? {}) as Record<string, string>;
    const productImages = new Map(assets("product-images").map((item) => [item.itemKey, item.url]));
    const productKeys = ["singleDeck", "doubleDeck", "threeRunner", "custom"];
    const mappedProducts = fallbackProducts.map((item, index) => ({
      ...item,
      imageUrl: productImages.get(productKeys[index]) ?? undefined,
    }));
    return {
      siteSettings: settings,
      homePage: {
        heroDesktopImage: asset("main-images", "heroDesktop"),
        heroMobileImage: asset("main-images", "heroMobile"),
        overviewImage: asset("main-images", "overview"),
        verificationImage: asset("main-images", "verification"),
        verificationReportThumbnail: asset("main-images", "verificationReport"),
        sustainabilityStatementThumbnail: asset("main-images", "carbonStatement"),
        productOverviewVideo: videoData.productOverviewVideo,
        productOverviewPoster: asset("intro-videos", "productOverviewPoster"),
        companyOverviewVideo: videoData.companyOverviewVideo,
        companyOverviewPoster: asset("intro-videos", "companyOverviewPoster"),
        processVideo: videoData.processVideo,
        processPoster: asset("intro-videos", "processPoster"),
      },
      products: mappedProducts,
      factoryImage: asset("company", "factory"),
    };
  } catch (error) {
    console.error("Website content DB fetch failed:", error);
    return null;
  }
}
