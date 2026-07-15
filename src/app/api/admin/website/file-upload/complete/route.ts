import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { ensureWebsiteContentBucket, websiteContentBucket } from "@/lib/supabaseAdmin";
import { getWebsiteSection } from "@/lib/websiteSections";

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
  }});
}
