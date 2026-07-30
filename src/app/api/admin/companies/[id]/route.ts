import { NextResponse } from "next/server";
import {
  canManageInquiries,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import {
  companyVisibilityWhere,
  visibleInquiryWhere,
} from "@/lib/admin/customerAccess";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  const { id } = await context.params;

  const item = await prisma.company.findFirst({
    where: { id, ...companyVisibilityWhere(admin) },
    select: {
      id: true,
      name: true,
      memo: true,
      privateMemos: {
        where: { adminUserId: admin.id },
        select: { memo: true },
        take: 1,
      },
      customers: {
        where: canManageInquiries(admin)
          ? { isArchived: false }
          : {
              isArchived: false,
              inquiries: {
                some: { assignedAdminId: admin.id },
              },
            },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          inquiries: {
            where: visibleInquiryWhere(admin),
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              registrationNumber: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!item) {
    return NextResponse.json(
      { success: false, message: "회사를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { privateMemos, ...company } = item;
  return NextResponse.json({
    success: true,
    item: {
      ...company,
      privateMemo: privateMemos[0]?.memo ?? null,
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  const { id } = await context.params;
  const body = (await request.json()) as {
    memo?: string;
    memoVisibility?: "SHARED" | "PRIVATE";
  };

  const company = await prisma.company.findFirst({
    where: { id, ...companyVisibilityWhere(admin) },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json(
      { success: false, message: "회사를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const memo = body.memo?.trim() || "";
  if (body.memoVisibility === "PRIVATE") {
    if (memo) {
      await prisma.companyPrivateMemo.upsert({
        where: {
          companyId_adminUserId: {
            companyId: id,
            adminUserId: admin.id,
          },
        },
        create: { companyId: id, adminUserId: admin.id, memo },
        update: { memo },
      });
    } else {
      await prisma.companyPrivateMemo.deleteMany({
        where: { companyId: id, adminUserId: admin.id },
      });
    }
  } else {
    await prisma.company.update({
      where: { id },
      data: { memo: memo || null },
    });
  }
  return NextResponse.json({ success: true });
}
