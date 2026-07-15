import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import {
  ensureWebsiteContentBucket,
  websiteContentBucket,
  websiteContentMaxFileSize,
} from "@/lib/supabaseAdmin";
import { getWebsiteSection } from "@/lib/websiteSections";

const pdfTypes = new Set(["application/pdf"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function safeName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();

  const form = await request.formData();
  const file = form.get("file");
  const sectionKey = String(form.get("sectionKey") || "");
  const itemKey = String(form.get("itemKey") || "");
  const label = String(form.get("label") || "파일");
  const requestedType = String(form.get("assetType") || "").toUpperCase();
  if (!getWebsiteSection(sectionKey) || !itemKey || !(file instanceof File)) {
    return NextResponse.json({ success: false, message: "업로드 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const isPdf = requestedType === "PDF" && pdfTypes.has(file.type);
  const isVideo = requestedType === "VIDEO" && videoTypes.has(file.type);
  if (!isPdf && !isVideo) {
    return NextResponse.json({ success: false, message: "PDF 또는 MP4·WEBM 영상만 등록할 수 있습니다." }, { status: 400 });
  }
  const maxBytes = isPdf ? 30 * 1024 * 1024 : websiteContentMaxFileSize;
  if (file.size > maxBytes) {
    return NextResponse.json({ success: false, message: isPdf ? "PDF는 30MB 이하만 등록할 수 있습니다." : "영상은 50MB 이하만 등록할 수 있습니다." }, { status: 400 });
  }

  const supabase = await ensureWebsiteContentBucket();
  if (!supabase) return NextResponse.json({ success: false, message: "파일 저장소 설정을 확인해 주세요." }, { status: 503 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const token = randomUUID();
  const storagePath = `${sectionKey}/files/${token}-${safeName(file.name)}`;
  const upload = await supabase.storage.from(websiteContentBucket).upload(storagePath, buffer, { contentType: file.type, upsert: false });
  if (upload.error) throw upload.error;
  const url = supabase.storage.from(websiteContentBucket).getPublicUrl(storagePath).data.publicUrl;

  return NextResponse.json({ success: true, asset: {
    itemKey,
    label,
    type: isPdf ? "PDF" : "VIDEO",
    url,
    storagePath,
    originalFileName: file.name,
    storedFileName: storagePath.split("/").pop(),
    mimeType: file.type,
    size: file.size,
    published: true,
  }});
}
