import { NextResponse } from "next/server";
import {
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!admin.isSuperAdmin) {
    return forbiddenResponse("고객 병합은 최고 관리자만 가능합니다.");
  }
  const { id: sourceCustomerId } = await context.params;
  const body = (await request.json()) as { targetCustomerId?: string };
  const targetCustomerId = body.targetCustomerId?.trim() || "";
  if (!targetCustomerId || targetCustomerId === sourceCustomerId) {
    return NextResponse.json(
      { success: false, message: "병합할 기존 고객을 선택해 주세요." },
      { status: 400 },
    );
  }

  const [source, target] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: sourceCustomerId },
      select: { id: true, memo: true },
    }),
    prisma.customer.findUnique({
      where: { id: targetCustomerId },
      select: { id: true, memo: true },
    }),
  ]);
  if (!source || !target) {
    return NextResponse.json(
      { success: false, message: "병합할 고객을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  await prisma.$transaction(async (tx) => {
    const favorites = await tx.customerFavorite.findMany({
      where: { customerId: sourceCustomerId },
      select: { adminUserId: true },
    });
    await tx.inquiry.updateMany({
      where: { customerId: sourceCustomerId },
      data: { customerId: targetCustomerId },
    });
    if (favorites.length > 0) {
      await tx.customerFavorite.createMany({
        data: favorites.map(({ adminUserId }) => ({
          adminUserId,
          customerId: targetCustomerId,
        })),
        skipDuplicates: true,
      });
    }
    if (!target.memo && source.memo) {
      await tx.customer.update({
        where: { id: targetCustomerId },
        data: { memo: source.memo },
      });
    }
    await tx.customer.delete({ where: { id: sourceCustomerId } });
  });

  return NextResponse.json({ success: true });
}
