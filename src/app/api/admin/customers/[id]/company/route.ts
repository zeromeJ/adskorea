import { NextResponse } from "next/server";
import {
  canManageInquiries,
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { customerVisibilityWhere } from "@/lib/admin/customerAccess";
import { normalizeCompanyName } from "@/lib/customerNormalization";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!canManageInquiries(admin)) {
    return forbiddenResponse(
      "회사 연결 변경은 최고 또는 보조 관리자만 가능합니다.",
    );
  }
  const { id } = await context.params;
  const body = (await request.json()) as {
    action?: "LINK" | "CREATE" | "UNLINK";
    companyId?: string;
    companyName?: string;
  };
  const customer = await prisma.customer.findFirst({
    where: { id, ...customerVisibilityWhere(admin) },
    select: {
      id: true,
      companyId: true,
      company: { select: { name: true } },
    },
  });
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "고객을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  let nextCompany: { id: string; name: string } | null = null;
  if (body.action === "LINK") {
    const companyId = body.companyId?.trim() || "";
    nextCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true },
    });
    if (!nextCompany) {
      return NextResponse.json(
        { success: false, message: "연결할 회사를 찾을 수 없습니다." },
        { status: 400 },
      );
    }
  } else if (body.action === "CREATE") {
    const name = body.companyName?.trim() || "";
    const normalizedName = normalizeCompanyName(name);
    if (!name || !normalizedName) {
      return NextResponse.json(
        { success: false, message: "새 회사명을 입력해 주세요." },
        { status: 400 },
      );
    }
    const duplicate = await prisma.company.findUnique({
      where: { normalizedName },
      select: { id: true, name: true },
    });
    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: `같은 이름의 회사가 있습니다: ${duplicate.name}`,
        },
        { status: 409 },
      );
    }
    nextCompany = await prisma.company.create({
      data: { name, normalizedName },
      select: { id: true, name: true },
    });
  } else if (body.action !== "UNLINK") {
    return NextResponse.json(
      { success: false, message: "회사 변경 방법을 다시 선택해 주세요." },
      { status: 400 },
    );
  }

  if (customer.companyId === nextCompany?.id) {
    return NextResponse.json({ success: true, item: nextCompany });
  }
  const changedAt = new Date();
  await prisma.$transaction([
    prisma.customer.update({
      where: { id },
      data: { companyId: nextCompany?.id ?? null },
    }),
    prisma.companyChangeLog.create({
      data: {
        customerId: id,
        adminUserId: admin.id,
        adminUsername: admin.username,
        adminDisplayName: admin.displayName,
        previousCompanyId: customer.companyId,
        previousCompanyName: customer.company?.name ?? null,
        newCompanyId: nextCompany?.id ?? null,
        newCompanyName: nextCompany?.name ?? null,
        createdAt: changedAt,
      },
    }),
  ]);
  return NextResponse.json({ success: true, item: nextCompany });
}
