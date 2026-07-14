import { defineQuery } from "next-sanity";
import { hasSanityConfig, sanityClient } from "@/sanity/lib/client";

const siteContentQuery = defineQuery(`{
  "siteSettings": *[_type == "siteSettings"][0]{
    brandName,
    brandNameEn,
    legalCompanyName,
    manufacturerName,
    salesCompanyName,
    email,
    phone,
    address,
    "logoUrl": logo.asset->url
  },
  "homePage": *[_type == "homePage"][0]{
    "heroDesktopImage": hero.desktopImage.asset->url,
    "heroMobileImage": hero.mobileImage.asset->url,
    "overviewImage": overviewImage.asset->url,
    processVideo,
    "processPoster": processPoster.asset->url,
    productOverviewVideo,
    "productOverviewPoster": productOverviewPoster.asset->url,
    companyOverviewVideo,
    "companyOverviewPoster": companyOverviewPoster.asset->url,
    "verificationImage": verificationImage.asset->url,
    "verificationReportThumbnail": verificationReportThumbnail.asset->url,
    "sustainabilityStatementThumbnail": sustainabilityStatementThumbnail.asset->url,
    sectionOrder,
    sectionVisibility
  },
  "products": *[_type == "product" && active == true] | order(order asc){
    "title": nameKo,
    "englishLabel": nameEn,
    "description": summary,
    "specs": applications,
    series,
    sizes,
    ratedDynamicLoad,
    ratedStaticLoad,
    disclaimer,
    "relatedTests": relatedTests[]->title,
    "mediaField": "product." + slug.current + ".gallery",
    "imageUrl": gallery[0].asset->url
  },
  "testResults": *[_type == "testResult" && active == true && publicDisclosure == true] | order(testDate asc){
    "id": _id,
    "label": title,
    organization,
    classification,
    reportNumber,
    "testDate": coalesce(testPeriod, string(testDate)),
    "specimen": coalesce(productModel, "") + " · " + coalesce(specimenSize, "") + select(defined(sampleQuantity) => " · " + sampleQuantity, "") + select(defined(productionBatch) => " · 생산 배치 " + productionBatch, ""),
    issueDate,
    sampleQuantity,
    productionBatch,
    results[]{name, value, referenceValue, judgement},
    "reportFileUrl": reportFile.asset->url
  },
  "industries": *[_type == "industry" && active == true] | order(order asc){
    title,
    streamId,
    description,
    "icon": iconName
  },
  "performanceVideos": *[_type == "testVideo" && active == true] | order(order asc){
    title,
    titleEn,
    category,
    durationSeconds,
    streamId,
    "videoUrl": externalUrl,
    "poster": poster.asset->url,
    description,
    disclaimer,
    "hasRelatedReports": count(relatedReports) > 0
  },
  "documents": *[_type == "downloadDocument" && active == true && documentType != "카탈로그" && (publicDownload == true || publicPreview == true)] | order(issueDate desc){
    title,
    documentType,
    issuer,
    reportNumber,
    issueDate,
    expiryDate,
    "relatedProducts": relatedProducts[]->nameKo,
    language,
    publicDownload,
    publicPreview,
    previewAvailable,
    "fileUrl": select(publicDownload == true => file.asset->url, ""),
    "previewUrl": select(previewAvailable == true => file.asset->url, ""),
    "thumbnailUrl": thumbnail.asset->url
  },
  "factoryImage": *[_type == "companyGallery" && active == true && category == "공장 전경"] | order(order asc)[0].image.asset->url,
  "catalog": *[_type == "downloadDocument" && active == true && featured == true && publicDownload == true && documentType == "카탈로그"][0]{
    title,
    language,
    version,
    "pages": string(pageCount),
    "updatedAt": issueDate,
    fileSize,
    "thumbnailUrl": thumbnail.asset->url,
    "fileUrl": file.asset->url
  }
}`);

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

export async function getCmsSiteContent(): Promise<CmsSiteContent | null> {
  if (!hasSanityConfig) return null;

  try {
    return await sanityClient.fetch<CmsSiteContent>(siteContentQuery, {}, {
      next: { revalidate: 300, tags: ["sanity-site-content"] },
    });
  } catch (error) {
    console.error("Sanity site content fetch failed:", error);
    return null;
  }
}
