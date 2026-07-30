import { NextResponse } from "next/server";
import {
  canManageInquiries,
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { inquiryVisibilityWhere } from "@/lib/admin/inquiryAccess";
import { sendInquiryAssignmentPush } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!canManageInquiries(admin)) {
    return forbiddenResponse("문의 담당자를 변경할 권한이 없습니다.");
  }

  const body = (await request.json()) as {
    inquiryIds?: string[];
    assignedAdminId?: string | null;
  };
  const inquiryIds = Array.from(
    new Set(
      (body.inquiryIds ?? [])
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );
  if (inquiryIds.length === 0 || inquiryIds.length > 100) {
    return NextResponse.json(
      { success: false, message: "변경할 문의를 1~100건 선택해 주세요." },
      { status: 400 },
    );
  }

  const assignedAdminId =
    typeof body.assignedAdminId === "string"
      ? body.assignedAdminId.trim() || null
      : null;
  const assignee = assignedAdminId
    ? await prisma.adminUser.findFirst({
        where: { id: assignedAdminId, isActive: true },
        select: { id: true, displayName: true },
      })
    : null;
  if (assignedAdminId && !assignee) {
    return NextResponse.json(
      { success: false, message: "배정할 관리자를 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  const inquiries = await prisma.inquiry.findMany({
    where: {
      id: { in: inquiryIds },
      ...inquiryVisibilityWhere(admin),
    },
    select: {
      id: true,
      companyName: true,
      assignedAdminId: true,
    },
  });
  if (inquiries.length !== inquiryIds.length) {
    return forbiddenResponse("접근할 수 없는 문의가 포함되어 있습니다.");
  }

  const changed = inquiries.filter(
    (inquiry) => inquiry.assignedAdminId !== assignedAdminId,
  );
  if (changed.length === 0) {
    return NextResponse.json({ success: true, changedCount: 0 });
  }

  const changedAt = new Date();
  await prisma.$transaction(async (tx) => {
    for (const inquiry of changed) {
      await tx.inquiry.update({
        where: { id: inquiry.id },
        data: {
          assignedAdminId,
          assignedAt: assignedAdminId ? changedAt : null,
          lastActionAt: changedAt,
        },
      });
      await tx.inquiryAssignmentLog.create({
        data: {
          inquiryId: inquiry.id,
          adminUserId: admin.id,
          adminUsername: admin.username,
          adminDisplayName: admin.displayName,
          assignedAdminId,
          assignedAdminDisplayName: assignee?.displayName ?? null,
        },
      });
    }
  });

  if (assignedAdminId) {
    await Promise.all(
      changed.map(async (inquiry) => {
        try {
          await sendInquiryAssignmentPush(
            inquiry.id,
            assignedAdminId,
            inquiry.companyName || "회사명 미입력",
          );
        } catch (error) {
          console.error("Bulk inquiry assignment push failed:", error);
        }
      }),
    );
  }

  return NextResponse.json({
    success: true,
    changedCount: changed.length,
  });
}
