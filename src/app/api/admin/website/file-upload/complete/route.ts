import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { ensureWebsiteContentBucket, websiteContentBucket } from "@/lib/supabaseAdmin";
import { getWebsiteSection } from "@/lib/websiteSections";

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char] ?? char);
}

async function createPdfCover(label: string) {
  const safeLabel = escapeXml(label).slice(0, 50);
  const svg = `<svg width="900" height="1273" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="1273" fill="#f4f5f1"/>
    <rect x="55" y="55" width="790" height="1163" rx="18" fill="#ffffff" stroke="#d8ddd7" stroke-width="4"/>
    <rect x="120" y="145" width="150" height="190" rx="14" fill="#175b3a"/>
    <text x="195" y="260" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="58" font-weight="700">PDF</text>
    <text x="120" y="445" fill="#163d2b" font-family="Arial, sans-serif" font-size="42" font-weight="700">${safeLabel}</text>
    <line x1="120" y1="510" x2="780" y2="510" stroke="#d8ddd7" stroke-width="3"/>
    <text x="120" y="585" fill="#667085" font-family="Arial, sans-serif" font-size="28">ADS Korea Document</text>
  </svg>`;
  return sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer();
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();

  const body = await request.json() as {
    sectionKey?: string;
    itemKey?: string;
    label?: string;
    assetType?: string;
    storagePath?: string;
    fileName?: string;
    mimeType?: string;
    size?: number;
  };
  const sectionKey = body.sectionKey ?? "";
  const itemKey = body.itemKey ?? "";
  const label = body.label ?? "파일";
  const assetType = (body.assetType ?? "").toUpperCase();
  const storagePath = body.storagePath ?? "";
  if (!getWebsiteSection(sectionKey) || !itemKey || !storagePath.startsWith(`${sectionKey}/files/`) || !["PDF", "VIDEO"].includes(assetType)) {
    return NextResponse.json({ success: false, message: "업로드 완료 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const supabase = await ensureWebsiteContentBucket();
  if (!supabase) {
    return NextResponse.json({ success: false, message: "파일 저장소 설정을 확인해 주세요." }, { status: 503 });
  }
  const url = supabase.storage.from(websiteContentBucket).getPublicUrl(storagePath).data.publicUrl;
  let thumbnailUrl: string | undefined;
  let thumbnailStoragePath: string | undefined;
  if (assetType === "PDF") {
    const cover = await createPdfCover(label);
    thumbnailStoragePath = `${sectionKey}/generated/${itemKey}-${Date.now()}-cover.webp`;
    const uploaded = await supabase.storage.from(websiteContentBucket).upload(thumbnailStoragePath, cover, { contentType: "image/webp", upsert: true });
    if (uploaded.error) throw uploaded.error;
    thumbnailUrl = supabase.storage.from(websiteContentBucket).getPublicUrl(thumbnailStoragePath).data.publicUrl;
  }

  return NextResponse.json({ success: true, asset: {
    itemKey,
    label,
    type: assetType,
    url,
    storagePath,
    originalFileName: body.fileName,
    storedFileName: storagePath.split("/").pop(),
    mimeType: body.mimeType,
    size: body.size,
    published: true,
    metadata: { thumbnailUrl, thumbnailStoragePath },
  }});
}
