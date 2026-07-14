import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { hasWebsiteContentModels, prisma } from "@/lib/prisma";
import { websiteSections } from "@/lib/websiteSections";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!hasWebsiteContentModels()) {
    return NextResponse.json(
      { success: false, message: "서버의 홈페이지 관리 모듈을 준비 중입니다. 서버를 다시 시작해 주세요." },
      { status: 503 },
    );
  }

  const stored = await prisma.websiteSection.findMany({
    include: { assets: { where: { published: true }, select: { id: true } } },
  });
  const byKey = new Map(stored.map((section) => [section.key, section]));
  const sections = websiteSections.map((definition) => {
    const section = byKey.get(definition.key);
    const registeredCount = section?.assets.length ?? 0;
    return {
      ...definition,
      registeredCount,
      status: definition.requiredCount === 0 ? "관리 항목 없음" : registeredCount === 0 ? "미등록" : registeredCount < definition.requiredCount ? "일부 등록" : "등록 완료",
      updatedAt: section?.updatedAt ?? null,
      updatedByName: section?.updatedByName ?? null,
    };
  });
  const logs = await prisma.websiteChangeLog.findMany({
    orderBy: { createdAt: "desc" }, take: 30,
  });
  return NextResponse.json({ success: true, sections, logs });
}
