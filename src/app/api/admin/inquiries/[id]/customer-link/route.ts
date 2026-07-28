import { NextResponse } from "next/server";
import {
  canManageInquiries,
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { inquiryVisibilityWhere } from "@/lib/admin/inquiryAccess";
import {
  normalizeCompanyName,
  normalizeEmail,
  normalizePhone,
} from "@/lib/customerNormalization";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!canManageInquiries(admin)) {
    return forbiddenResponse("고객 연결을 확인할 권한이 없습니다.");
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    action?: "LINK" | "KEEP_SEPARATE";
    candidateCustomerId?: string;
  };
  const inquiry = await prisma.inquiry.findFirst({
    where: { id, ...inquiryVisibilityWhere(admin) },
    select: { id: true, customerId: true },
  });
  if (!inquiry) {
    return NextResponse.json(
      { success: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (body.action === "KEEP_SEPARATE") {
    await prisma.customerDuplicateReview.updateMany({
      where: {
        newCustomerId: inquiry.customerId,
        status: "PENDING",
      },
      data: {
        status: "KEPT_SEPARATE",
        resolvedByAdminId: admin.id,
        resolvedByDisplayName: admin.displayName,
        resolvedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true });
  }

  const candidateCustomerId = body.candidateCustomerId?.trim() || "";
  const review = await prisma.customerDuplicateReview.findFirst({
    where: {
      newCustomerId: inquiry.customerId,
      candidateCustomerId,
      status: "PENDING",
    },
    select: { id: true },
  });
  if (!review) {
    return NextResponse.json(
      { success: false, message: "연결할 기존 고객 후보를 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.inquiry.update({
      where: { id },
      data: { customerId: candidateCustomerId },
    });
    await tx.customerDuplicateReview.update({
      where: { id: review.id },
      data: {
        status: "LINKED",
        resolvedByAdminId: admin.id,
        resolvedByDisplayName: admin.displayName,
        resolvedAt: new Date(),
      },
    });
    await tx.customerDuplicateReview.updateMany({
      where: {
        newCustomerId: inquiry.customerId,
        id: { not: review.id },
        status: "PENDING",
      },
      data: {
        status: "KEPT_SEPARATE",
        resolvedByAdminId: admin.id,
        resolvedByDisplayName: admin.displayName,
        resolvedAt: new Date(),
      },
    });
    const remaining = await tx.inquiry.count({
      where: { customerId: inquiry.customerId },
    });
    if (remaining === 0) {
      await tx.customer.delete({ where: { id: inquiry.customerId } });
    }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!admin.isSuperAdmin) {
    return forbiddenResponse("고객 연결 해제는 최고 관리자만 가능합니다.");
  }
  const { id } = await context.params;
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: {
      id: true,
      customerId: true,
      contactPerson: true,
      phone: true,
      email: true,
      companyName: true,
      customer: {
        select: {
          normalizedPhone: true,
          normalizedEmail: true,
          companyId: true,
        },
      },
    },
  });
  if (!inquiry) {
    return NextResponse.json(
      { success: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  await prisma.$transaction(async (tx) => {
    const normalizedPhone = normalizePhone(inquiry.phone);
    const normalizedEmail = normalizeEmail(inquiry.email);
    const normalizedCompanyName = normalizeCompanyName(inquiry.companyName);
    const company = normalizedCompanyName
      ? await tx.company.upsert({
          where: { normalizedName: normalizedCompanyName },
          create: {
            name: inquiry.companyName,
            normalizedName: normalizedCompanyName,
          },
          update: {},
          select: { id: true },
        })
      : null;
    const customer = await tx.customer.create({
      data: {
        name: inquiry.contactPerson,
        phone: inquiry.phone,
        normalizedPhone,
        email: inquiry.email,
        normalizedEmail,
        companyId: company?.id,
      },
    });
    await tx.inquiry.update({
      where: { id },
      data: { customerId: customer.id },
    });
    await tx.customerDuplicateReview.create({
      data: {
        newCustomerId: customer.id,
        candidateCustomerId: inquiry.customerId,
        matchedPhone:
          normalizedPhone !== null &&
          normalizedPhone === inquiry.customer.normalizedPhone,
        matchedEmail:
          normalizedEmail !== null &&
          normalizedEmail === inquiry.customer.normalizedEmail,
        matchedCompany:
          company !== null && company.id === inquiry.customer.companyId,
        status: "KEPT_SEPARATE",
        resolvedByAdminId: admin.id,
        resolvedByDisplayName: admin.displayName,
        resolvedAt: new Date(),
      },
    });
  });

  return NextResponse.json({ success: true });
}
