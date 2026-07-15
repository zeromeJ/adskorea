import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { ensureWebsiteContentBucket, websiteContentBucket } from "@/lib/supabaseAdmin";
import { getWebsiteSection } from "@/lib/websiteSections";

const pdfTypes = new Set(["application/pdf"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function safeName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();

  const body = await request.json() as {
    sectionKey?: string;
    itemKey?: string;
    fileName?: string;
    mimeType?: string;
    size?: number;
    assetType?: string;
  };
  const sectionKey = body.sectionKey ?? "";
  const itemKey = body.itemKey ?? "";
  const fileName = body.fileName ?? "file";
  const mimeType = body.mimeType ?? "";
  const assetType = (body.assetType ?? "").toUpperCase();
  const size = Number(body.size ?? 0);
  if (!getWebsiteSection(sectionKey) || !itemKey) {
    return NextResponse.json({ success: false, message: "업로드 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const isPdf = assetType === "PDF" && pdfTypes.has(mimeType);
  const isVideo = assetType === "VIDEO" && videoTypes.has(mimeType);
  if (!isPdf && !isVideo) {
    return NextResponse.json({ success: false, message: "PDF 또는 MP4·WEBM 영상만 등록할 수 있습니다." }, { status: 400 });
  }
  const maxBytes = isPdf ? 30 * 1024 * 1024 : 150 * 1024 * 1024;
  if (size <= 0 || size > maxBytes) {
    return NextResponse.json({ success: false, message: isPdf ? "PDF는 30MB 이하만 등록할 수 있습니다." : "영상은 150MB 이하만 등록할 수 있습니다." }, { status: 400 });
  }

  const supabase = await ensureWebsiteContentBucket();
  if (!supabase) {
    return NextResponse.json({ success: false, message: "파일 저장소 설정을 확인해 주세요." }, { status: 503 });
  }
  const storagePath = `${sectionKey}/files/${randomUUID()}-${safeName(fileName)}`;
  const signed = await supabase.storage.from(websiteContentBucket).createSignedUploadUrl(storagePath);
  if (signed.error) throw signed.error;

  return NextResponse.json({
    success: true,
    signedUrl: signed.data.signedUrl,
    storagePath,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  });
}
