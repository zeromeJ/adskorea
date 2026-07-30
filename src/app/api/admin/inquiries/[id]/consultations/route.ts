import { InquiryConsultationResult } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { inquiryVisibilityWhere } from "@/lib/admin/inquiryAccess";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedResults = new Set<InquiryConsultationResult>([
  "PHONE_COMPLETED",
  "MATERIAL_SENT",
  "QUOTE_REVIEW",
  "WAITING_RESPONSE",
  "UNREACHABLE",
  "OTHER",
]);

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();

  const { id } = await context.params;
  const body = (await request.json()) as {
    result?: InquiryConsultationResult;
    memo?: string;
  };
  if (!body.result || !allowedResults.has(body.result)) {
    return NextResponse.json(
      { success: false, message: "처리 결과를 선택해 주세요." },
      { status: 400 },
    );
  }

  const inquiry = await prisma.inquiry.findFirst({
    where: { id, ...inquiryVisibilityWhere(admin) },
    select: { id: true, assignedAdminId: true },
  });
  if (!inquiry) {
    return NextResponse.json(
      { success: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (!admin.isSuperAdmin && inquiry.assignedAdminId !== admin.id) {
    return forbiddenResponse("본인에게 배정된 문의만 기록할 수 있습니다.");
  }

  const record = await prisma.$transaction(async (tx) => {
    const created = await tx.inquiryConsultationRecord.create({
      data: {
        inquiryId: id,
        result: body.result!,
        memo: body.memo?.trim() || null,
        adminUserId: admin.id,
        adminUsername: admin.username,
        adminDisplayName: admin.displayName,
      },
    });
    await tx.inquiry.update({
      where: { id },
      data: { lastActionAt: new Date() },
    });
    return created;
  });

  return NextResponse.json({ success: true, item: record });
}
