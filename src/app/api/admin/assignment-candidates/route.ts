import { NextResponse } from "next/server";
import {
  canManageInquiries,
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) return unauthorizedResponse();
  if (!canManageInquiries(admin)) {
    return forbiddenResponse("문의 담당자를 배정할 권한이 없습니다.");
  }

  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const [items, staleGroups] = await Promise.all([
    prisma.adminUser.findMany({
    where: { isActive: true },
    orderBy: [
      { isSuperAdmin: "desc" },
      { isAssistantAdmin: "desc" },
      { displayName: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      displayName: true,
      isActive: true,
      isSuperAdmin: true,
      isAssistantAdmin: true,
      _count: {
        select: {
          assignedInquiries: {
            where: { status: "PENDING" },
          },
        },
      },
    },
    }),
    prisma.inquiry.groupBy({
      by: ["assignedAdminId"],
      where: {
        assignedAdminId: { not: null },
        status: "PENDING",
        lastActionAt: { lte: threeDaysAgo },
      },
      _count: { _all: true },
    }),
  ]);
  const staleByAdminId = new Map(
    staleGroups.flatMap((item) =>
      item.assignedAdminId
        ? [[item.assignedAdminId, item._count._all] as const]
        : [],
    ),
  );

  return NextResponse.json({
    success: true,
    items: items.map(({ _count, ...item }) => ({
      ...item,
      pendingInquiryCount: _count.assignedInquiries,
      staleThreeDayCount: staleByAdminId.get(item.id) ?? 0,
    })),
  });
}
