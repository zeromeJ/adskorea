import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import {
  ensureWebsiteContentBucket,
  websiteContentBucket,
} from "@/lib/supabaseAdmin";
import { getWebsiteSection } from "@/lib/websiteSections";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeName(name: string) {
  return (
    name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image"
  );
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();

  try {
    const body = (await request.json()) as {
      sectionKey?: string;
      itemKey?: string;
      fileName?: string;
      originalMimeType?: string;
      originalSize?: number;
      editedSize?: number;
    };
    const sectionKey = body.sectionKey ?? "";
    const itemKey = body.itemKey ?? "";
    const fileName = body.fileName ?? "image";
    const originalMimeType = body.originalMimeType ?? "";
    const originalSize = Number(body.originalSize ?? 0);
    const editedSize = Number(body.editedSize ?? 0);

    if (!getWebsiteSection(sectionKey) || !itemKey) {
      return NextResponse.json(
        { success: false, message: "업로드 정보가 올바르지 않습니다." },
        { status: 400 },
      );
    }
    if (!imageTypes.has(originalMimeType)) {
      return NextResponse.json(
        {
          success: false,
          message: "JPG, PNG, WEBP 이미지만 등록할 수 있습니다.",
        },
        { status: 400 },
      );
    }
    if (
      originalSize <= 0 ||
      originalSize > 20 * 1024 * 1024 ||
      editedSize <= 0 ||
      editedSize > 30 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "원본 이미지는 20MB, 편집 이미지는 30MB 이하만 등록할 수 있습니다.",
        },
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

    const token = randomUUID();
    const originalStoragePath = `${sectionKey}/original/${token}-${safeName(fileName)}`;
    const editedStoragePath = `${sectionKey}/staging/${token}-edited.png`;
    const [originalSigned, editedSigned] = await Promise.all([
      supabase.storage
        .from(websiteContentBucket)
        .createSignedUploadUrl(originalStoragePath),
      supabase.storage
        .from(websiteContentBucket)
        .createSignedUploadUrl(editedStoragePath),
    ]);
    if (originalSigned.error) throw originalSigned.error;
    if (editedSigned.error) throw editedSigned.error;

    return NextResponse.json({
      success: true,
      originalSignedUrl: originalSigned.data.signedUrl,
      editedSignedUrl: editedSigned.data.signedUrl,
      originalStoragePath,
      editedStoragePath,
      publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    });
  } catch (error) {
    console.error("Website image upload prepare failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "이미지 업로드를 준비하지 못했습니다. 서버 저장소 설정을 확인해 주세요.",
      },
      { status: 500 },
    );
  }
}
