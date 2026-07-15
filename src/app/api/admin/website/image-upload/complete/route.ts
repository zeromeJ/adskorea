import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import {
  ensureWebsiteContentBucket,
  websiteContentBucket,
} from "@/lib/supabaseAdmin";
import { getWebsiteSection } from "@/lib/websiteSections";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();

  try {
    const body = (await request.json()) as {
      sectionKey?: string;
      itemKey?: string;
      label?: string;
      originalStoragePath?: string;
      editedStoragePath?: string;
      originalFileName?: string;
      originalMimeType?: string;
      originalSize?: number;
      aspectRatio?: string;
      outputWidth?: number;
      outputHeight?: number;
      cropX?: number;
      cropY?: number;
      cropWidth?: number;
      cropHeight?: number;
      zoom?: number;
      rotation?: number;
    };
    const sectionKey = body.sectionKey ?? "";
    const itemKey = body.itemKey ?? "";
    const originalStoragePath = body.originalStoragePath ?? "";
    const editedStoragePath = body.editedStoragePath ?? "";

    if (
      !getWebsiteSection(sectionKey) ||
      !itemKey ||
      !originalStoragePath.startsWith(`${sectionKey}/original/`) ||
      !editedStoragePath.startsWith(`${sectionKey}/staging/`)
    ) {
      return NextResponse.json(
        { success: false, message: "업로드 완료 정보가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const supabase = await ensureWebsiteContentBucket();
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          message:
            "파일 저장소 설정이 없습니다. Vercel의 SUPABASE_SERVICE_ROLE_KEY를 확인해 주세요.",
        },
        { status: 503 },
      );
    }

    const [originalDownload, editedDownload] = await Promise.all([
      supabase.storage.from(websiteContentBucket).download(originalStoragePath),
      supabase.storage.from(websiteContentBucket).download(editedStoragePath),
    ]);
    if (originalDownload.error) throw originalDownload.error;
    if (editedDownload.error) throw editedDownload.error;

    const sourceBuffer = Buffer.from(await originalDownload.data.arrayBuffer());
    const editedBuffer = Buffer.from(await editedDownload.data.arrayBuffer());
    const originalMeta = await sharp(sourceBuffer).metadata();
    const editedMeta = await sharp(editedBuffer).metadata();
    const outputWidth = Math.max(
      1,
      Number(body.outputWidth ?? editedMeta.width ?? 1),
    );
    const outputHeight = Math.max(
      1,
      Number(body.outputHeight ?? editedMeta.height ?? 1),
    );
    const hasAlpha = Boolean(editedMeta.hasAlpha);
    const pipeline = sharp(editedBuffer).rotate().resize(outputWidth, outputHeight, {
      fit: "cover",
      position: itemKey === "heroMobile" ? "attention" : "centre",
      withoutEnlargement: true,
    });
    const outputMime = hasAlpha ? "image/png" : "image/webp";
    const outputExtension = hasAlpha ? "png" : "webp";
    const finalBuffer = hasAlpha
      ? await pipeline.png({ compressionLevel: 8 }).toBuffer()
      : await pipeline.webp({ quality: 88 }).toBuffer();
    const finalMeta = await sharp(finalBuffer).metadata();
    const outputPath = `${sectionKey}/published/${randomUUID()}.${outputExtension}`;
    const outputUpload = await supabase.storage
      .from(websiteContentBucket)
      .upload(outputPath, finalBuffer, {
        contentType: outputMime,
        upsert: false,
      });
    if (outputUpload.error) throw outputUpload.error;
    await supabase.storage
      .from(websiteContentBucket)
      .remove([editedStoragePath]);

    const originalUrl = supabase.storage
      .from(websiteContentBucket)
      .getPublicUrl(originalStoragePath).data.publicUrl;
    const url = supabase.storage
      .from(websiteContentBucket)
      .getPublicUrl(outputPath).data.publicUrl;

    return NextResponse.json({
      success: true,
      asset: {
        itemKey,
        label: body.label ?? "이미지",
        type: "IMAGE",
        url,
        originalUrl,
        storagePath: outputPath,
        originalStoragePath,
        originalFileName: body.originalFileName,
        storedFileName: outputPath.split("/").pop(),
        mimeType: outputMime,
        size: finalBuffer.length,
        width: originalMeta.width,
        height: originalMeta.height,
        cropX: Number(body.cropX ?? 0),
        cropY: Number(body.cropY ?? 0),
        cropWidth: Number(body.cropWidth ?? 1),
        cropHeight: Number(body.cropHeight ?? 1),
        zoom: Number(body.zoom ?? 1),
        rotation: Number(body.rotation ?? 0),
        aspectRatio: body.aspectRatio ?? "",
        outputWidth: finalMeta.width,
        outputHeight: finalMeta.height,
        published: true,
        lowResolution:
          (originalMeta.width ?? 0) < outputWidth ||
          (originalMeta.height ?? 0) < outputHeight,
      },
    });
  } catch (error) {
    console.error("Website image upload complete failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "이미지를 저장하지 못했습니다. 서버 저장소와 파일 형식을 확인해 주세요.",
      },
      { status: 500 },
    );
  }
}
