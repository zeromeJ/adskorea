import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rateLimit";
import {
  ensureInquiryAttachmentBucket,
  inquiryAttachmentBucket,
} from "@/lib/supabaseAdmin";

const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const zipTypes = new Set([
  "",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
]);
const maxUploadBytes = 50 * 1024 * 1024;
const uploadSupportEmail = "bossjhb@naver.com";

type RouteContext = { params: Promise<{ id: string }> };

function safeFileName(value: string) {
  return value.normalize("NFKC").replace(/[^a-zA-Z0-9가-힣._-]/g, "_");
}

function isZipFile(file: File) {
  return (
    file.name.toLowerCase().endsWith(".zip") &&
    zipTypes.has(file.type.toLowerCase())
  );
}

export async function POST(request: Request, context: RouteContext) {
  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(`attachment:${clientKey}`)) {
    return NextResponse.json(
      { success: false, message: "잠시 후 다시 시도해 주세요." },
      { status: 429 },
    );
  }

  const { id } = await context.params;
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: { id: true, createdAt: true },
  });

  if (!inquiry || Date.now() - inquiry.createdAt.getTime() > 30 * 60 * 1000) {
    return NextResponse.json(
      { success: false, message: "첨부 가능한 문의를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (files.length === 0 || files.length > 3) {
    return NextResponse.json(
      { success: false, message: "첨부파일은 최대 3개까지 선택해 주세요." },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (file.size > maxUploadBytes) {
      return NextResponse.json(
        {
          success: false,
          code: "FILE_TOO_LARGE",
          message: `파일 용량이 커서 웹에서 업로드할 수 없습니다. 50MB 이하로 줄이거나 파일을 나누어 첨부해 주세요. 어려우시면 ${uploadSupportEmail}으로 보내 주세요.`,
          supportEmail: uploadSupportEmail,
        },
        { status: 413 },
      );
    }

    if (!allowedTypes.has(file.type) && !isZipFile(file)) {
      return NextResponse.json(
        {
          success: false,
          message: "PDF, JPG, PNG, WEBP, ZIP 파일만 첨부할 수 있습니다.",
        },
        { status: 400 },
      );
    }
  }

  const supabase = await ensureInquiryAttachmentBucket();
  if (!supabase) {
    return NextResponse.json(
      { success: false, message: "파일 저장소 설정이 완료되지 않았습니다." },
      { status: 503 },
    );
  }

  const uploadedPaths: string[] = [];

  try {
    for (const file of files) {
      const path = `${id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const contentType = isZipFile(file) ? "application/zip" : file.type;
      const { error } = await supabase.storage
        .from(inquiryAttachmentBucket)
        .upload(path, await file.arrayBuffer(), {
          contentType,
          upsert: false,
        });

      if (error) throw error;
      uploadedPaths.push(path);

      await prisma.inquiryAttachment.create({
        data: {
          inquiryId: id,
          fileName: file.name,
          contentType,
          size: file.size,
          storagePath: path,
        },
      });
    }
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from(inquiryAttachmentBucket).remove(uploadedPaths);
      await prisma.inquiryAttachment.deleteMany({
        where: { storagePath: { in: uploadedPaths } },
      });
    }
    console.error("Inquiry attachment upload failed:", error);
    return NextResponse.json(
      { success: false, message: "첨부파일 저장에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
