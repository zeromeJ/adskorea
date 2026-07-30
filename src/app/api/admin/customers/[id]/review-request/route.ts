import { CustomerReviewRequestType } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { customerVisibilityWhere } from "@/lib/admin/customerAccess";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  const { id } = await context.params;
  const body = (await request.json()) as {
    type?: CustomerReviewRequestType;
    note?: string;
  };
  if (
    body.type !== "DUPLICATE_REVIEW" &&
    body.type !== "COMPANY_REVIEW"
  ) {
    return NextResponse.json(
      { success: false, message: "검토 요청 종류를 선택해 주세요." },
      { status: 400 },
    );
  }
  const customer = await prisma.customer.findFirst({
    where: { id, ...customerVisibilityWhere(admin) },
    select: { id: true },
  });
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "고객을 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  const duplicate = await prisma.customerReviewRequest.findFirst({
    where: {
      customerId: id,
      requestedById: admin.id,
      type: body.type,
      status: "PENDING",
    },
    select: { id: true },
  });
  if (!duplicate) {
    await prisma.customerReviewRequest.create({
      data: {
        customerId: id,
        requestedById: admin.id,
        requestedByName: admin.displayName || admin.username,
        type: body.type,
        note: body.note?.trim() || null,
      },
    });
  }
  return NextResponse.json({ success: true });
}
