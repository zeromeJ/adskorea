import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { ensureWebsiteContentBucket, websiteContentBucket } from "@/lib/supabaseAdmin";
import { getWebsiteSection } from "@/lib/websiteSections";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  const form = await request.formData();
  const original = form.get("original");
  const edited = form.get("edited");
  const sectionKey = String(form.get("sectionKey") || "");
  const itemKey = String(form.get("itemKey") || "");
  const label = String(form.get("label") || "이미지");
  if (!getWebsiteSection(sectionKey) || !itemKey || !(original instanceof File)) {
    return NextResponse.json({ success: false, message: "업로드 정보가 올바르지 않습니다." }, { status: 400 });
  }
  if (original.type && original.type !== "application/octet-stream" && !imageTypes.has(original.type)) {
    return NextResponse.json({ success: false, message: "JPG, PNG, WEBP 이미지만 등록할 수 있습니다." }, { status: 400 });
  }
  if (original.size > 20 * 1024 * 1024) {
    return NextResponse.json({ success: false, message: "파일 용량은 20MB 이하만 등록할 수 있습니다." }, { status: 400 });
  }

  const sourceBuffer = Buffer.from(await original.arrayBuffer());
  const editedBuffer = edited instanceof File ? Buffer.from(await edited.arrayBuffer()) : sourceBuffer;
  const originalMeta = await sharp(sourceBuffer).metadata();
  const originalMime = originalMeta.format === "png" ? "image/png" : originalMeta.format === "webp" ? "image/webp" : originalMeta.format === "jpeg" ? "image/jpeg" : null;
  if (!originalMime) {
    return NextResponse.json({ success: false, message: "JPG, PNG, WEBP 이미지만 등록할 수 있습니다." }, { status: 400 });
  }
  const outputWidth = Math.max(1, Number(form.get("outputWidth") || originalMeta.width || 1));
  const outputHeight = Math.max(1, Number(form.get("outputHeight") || originalMeta.height || 1));
  const hasAlpha = Boolean((await sharp(editedBuffer).metadata()).hasAlpha);
  const pipeline = sharp(editedBuffer).rotate().resize(outputWidth, outputHeight, {
    fit: "cover", position: "centre", withoutEnlargement: true,
  });
  const outputMime = hasAlpha ? "image/png" : "image/webp";
  const outputExtension = hasAlpha ? "png" : "webp";
  const finalBuffer = hasAlpha ? await pipeline.png({ compressionLevel: 8 }).toBuffer() : await pipeline.webp({ quality: 88 }).toBuffer();
  const finalMeta = await sharp(finalBuffer).metadata();

  const supabase = await ensureWebsiteContentBucket();
  if (!supabase) return NextResponse.json({ success: false, message: "파일 저장소 설정을 확인해 주세요." }, { status: 503 });
  const token = randomUUID();
  const originalPath = `${sectionKey}/original/${token}-${safeName(original.name)}`;
  const outputPath = `${sectionKey}/published/${token}.${outputExtension}`;
  const originalUpload = await supabase.storage.from(websiteContentBucket).upload(originalPath, sourceBuffer, { contentType: originalMime, upsert: false });
  if (originalUpload.error) throw originalUpload.error;
  const outputUpload = await supabase.storage.from(websiteContentBucket).upload(outputPath, finalBuffer, { contentType: outputMime, upsert: false });
  if (outputUpload.error) {
    await supabase.storage.from(websiteContentBucket).remove([originalPath]);
    throw outputUpload.error;
  }
  const originalUrl = supabase.storage.from(websiteContentBucket).getPublicUrl(originalPath).data.publicUrl;
  const url = supabase.storage.from(websiteContentBucket).getPublicUrl(outputPath).data.publicUrl;
  return NextResponse.json({ success: true, asset: {
    itemKey, label, type: "IMAGE", url, originalUrl, storagePath: outputPath,
    originalStoragePath: originalPath, originalFileName: original.name,
    storedFileName: `${token}.${outputExtension}`, mimeType: outputMime, size: finalBuffer.length,
    width: originalMeta.width, height: originalMeta.height,
    cropX: Number(form.get("cropX") || 0), cropY: Number(form.get("cropY") || 0),
    cropWidth: Number(form.get("cropWidth") || 1), cropHeight: Number(form.get("cropHeight") || 1),
    zoom: Number(form.get("zoom") || 1), rotation: Number(form.get("rotation") || 0),
    aspectRatio: String(form.get("aspectRatio") || ""), outputWidth: finalMeta.width,
    outputHeight: finalMeta.height, published: true,
    lowResolution: (originalMeta.width || 0) < outputWidth || (originalMeta.height || 0) < outputHeight,
  }});
}
