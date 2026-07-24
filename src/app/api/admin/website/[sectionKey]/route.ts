import { Prisma, WebsiteAssetType } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { hasWebsiteContentModels, prisma } from "@/lib/prisma";
import { getWebsiteSection } from "@/lib/websiteSections";

type Context = { params: Promise<{ sectionKey: string }> };

export async function GET(request: Request, context: Context) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!hasWebsiteContentModels()) return NextResponse.json({ success: false, message: "서버를 다시 시작한 후 이용해 주세요." }, { status: 503 });
  const { sectionKey } = await context.params;
  const definition = getWebsiteSection(sectionKey);
  if (!definition) return NextResponse.json({ success: false, message: "관리 섹션을 찾을 수 없습니다." }, { status: 404 });
  const section = await prisma.websiteSection.findUnique({
    where: { key: sectionKey }, include: { assets: { orderBy: [{ itemKey: "asc" }, { sortOrder: "asc" }] } },
  });
  return NextResponse.json({ success: true, section: section ?? { ...definition, data: null, assets: [] } });
}

type AssetInput = {
  id?: string; itemKey: string; label: string; type: WebsiteAssetType;
  url?: string; originalUrl?: string; storagePath?: string; originalStoragePath?: string;
  originalFileName?: string; storedFileName?: string; mimeType?: string; size?: number;
  width?: number; height?: number; cropX?: number; cropY?: number; cropWidth?: number;
  cropHeight?: number; zoom?: number; rotation?: number; aspectRatio?: string;
  outputWidth?: number; outputHeight?: number; sortOrder?: number; published?: boolean;
  metadata?: Prisma.InputJsonValue;
};

export async function PUT(request: Request, context: Context) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!hasWebsiteContentModels()) return NextResponse.json({ success: false, message: "서버를 다시 시작한 후 이용해 주세요." }, { status: 503 });
  try {
    const { sectionKey } = await context.params;
    const definition = getWebsiteSection(sectionKey);
    if (!definition) return NextResponse.json({ success: false, message: "관리 섹션을 찾을 수 없습니다." }, { status: 404 });
    const body = await request.json() as { data?: Prisma.InputJsonValue; assets?: AssetInput[] };
    const previous = await prisma.websiteSection.findUnique({ where: { key: sectionKey }, include: { assets: true } });
    const assets = body.assets ?? [];
    const nextData = body.data === undefined
      ? previous?.data ?? Prisma.JsonNull
      : body.data;
    const assetRows: Prisma.WebsiteAssetCreateManyInput[] = assets.map((asset) => ({
      sectionKey,
      itemKey: asset.itemKey,
      label: asset.label,
      type: asset.type,
      url: asset.url,
      originalUrl: asset.originalUrl,
      storagePath: asset.storagePath,
      originalStoragePath: asset.originalStoragePath,
      originalFileName: asset.originalFileName,
      storedFileName: asset.storedFileName,
      mimeType: asset.mimeType,
      size: asset.size,
      width: asset.width,
      height: asset.height,
      cropX: asset.cropX,
      cropY: asset.cropY,
      cropWidth: asset.cropWidth,
      cropHeight: asset.cropHeight,
      zoom: asset.zoom,
      rotation: asset.rotation,
      aspectRatio: asset.aspectRatio,
      outputWidth: asset.outputWidth,
      outputHeight: asset.outputHeight,
      sortOrder: asset.sortOrder ?? 0,
      published: asset.published ?? true,
      metadata: asset.metadata,
    }));
    const section = await prisma.$transaction(async (tx) => {
      const saved = await tx.websiteSection.upsert({
        where: { key: sectionKey },
        create: { key: sectionKey, title: definition.title, requiredCount: definition.requiredCount, data: nextData, updatedById: admin.id, updatedByName: admin.displayName ?? admin.username },
        update: { title: definition.title, requiredCount: definition.requiredCount, data: nextData, updatedById: admin.id, updatedByName: admin.displayName ?? admin.username },
      });
      await tx.websiteAsset.deleteMany({ where: { sectionKey } });
      if (assetRows.length > 0) {
        await tx.websiteAsset.createMany({ data: assetRows });
      }
      await tx.websiteChangeLog.create({ data: {
        sectionKey, sectionTitle: definition.title, action: previous ? "수정" : "등록",
        adminUserId: admin.id, adminUsername: admin.username, adminDisplayName: admin.displayName,
        previousData: previous ? JSON.parse(JSON.stringify(previous)) : Prisma.JsonNull,
        newData: JSON.parse(JSON.stringify({
          data: nextData === Prisma.JsonNull ? null : nextData,
          assets,
        })),
      }});
      return tx.websiteSection.findUnique({ where: { key: saved.key }, include: { assets: { orderBy: { sortOrder: "asc" } } } });
    }, {
      maxWait: 5_000,
      timeout: 15_000,
    });
    revalidatePath("/");
    return NextResponse.json({ success: true, section, message: "홈페이지에 반영되었습니다." });
  } catch (error) {
    console.error("Website section save failed:", error);
    return NextResponse.json(
      { success: false, message: "홈페이지 변경사항을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
