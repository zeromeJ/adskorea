import { InquiryStatus, Prisma } from "@prisma/client";
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
import {
  getSupabaseAdmin,
  inquiryAttachmentBucket,
} from "@/lib/supabaseAdmin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const item = await prisma.inquiry.findFirst({
    where: { id, ...inquiryVisibilityWhere(admin) },
    include: {
      assignedAdmin: {
        select: {
          id: true,
          username: true,
          displayName: true,
          isActive: true,
          isSuperAdmin: true,
          isAssistantAdmin: true,
        },
      },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!item) {
    return NextResponse.json(
      { success: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const supabase = getSupabaseAdmin();
  const attachments = await Promise.all(
    item.attachments.map(async (attachment) => {
      if (!supabase) return { ...attachment, downloadUrl: null };
      const { data } = await supabase.storage
        .from(inquiryAttachmentBucket)
        .createSignedUrl(attachment.storagePath, 60 * 60);
      return { ...attachment, downloadUrl: data?.signedUrl ?? null };
    }),
  );

  return NextResponse.json({
    success: true,
    item: { ...item, attachments },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    status?: InquiryStatus;
    adminMemo?: string;
    assignedAdminId?: string | null;
  };

  const data: Prisma.InquiryUncheckedUpdateInput = {};
  const hasAssignmentUpdate = Object.prototype.hasOwnProperty.call(
    body,
    "assignedAdminId",
  );

  if (body.status) {
    if (body.status !== "PENDING" && body.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, message: "상태값이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    data.status = body.status;
  }

  if (typeof body.adminMemo === "string") {
    data.adminMemo = body.adminMemo.trim() || null;
  }

  if (hasAssignmentUpdate && !canManageInquiries(admin)) {
    return forbiddenResponse("문의 담당자를 배정할 권한이 없습니다.");
  }

  const currentItem = await prisma.inquiry.findFirst({
    where: { id, ...inquiryVisibilityWhere(admin) },
  });

  if (!currentItem) {
    return NextResponse.json(
      { success: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const hasInquiryContentUpdate =
    body.status !== undefined || typeof body.adminMemo === "string";
  if (
    hasInquiryContentUpdate &&
    !admin.isSuperAdmin &&
    currentItem.assignedAdminId !== admin.id
  ) {
    return forbiddenResponse("본인에게 배정된 문의만 처리할 수 있습니다.");
  }

  const nextAssignedAdminId = hasAssignmentUpdate
    ? typeof body.assignedAdminId === "string"
      ? body.assignedAdminId.trim() || null
      : null
    : currentItem.assignedAdminId;

  let nextAssignedAdminDisplayName: string | null = null;
  if (hasAssignmentUpdate && nextAssignedAdminId) {
    const assignee = await prisma.adminUser.findFirst({
      where: { id: nextAssignedAdminId, isActive: true },
      select: { id: true, displayName: true },
    });
    if (!assignee) {
      return NextResponse.json(
        { success: false, message: "배정할 관리자를 찾을 수 없습니다." },
        { status: 400 },
      );
    }
    nextAssignedAdminDisplayName = assignee.displayName;
  }

  const assignmentChanged =
    hasAssignmentUpdate &&
    nextAssignedAdminId !== currentItem.assignedAdminId;
  if (assignmentChanged) {
    data.assignedAdminId = nextAssignedAdminId;
    data.assignedAt = nextAssignedAdminId ? new Date() : null;
  }

  const shouldLogCompletion =
    data.status === "COMPLETED" && currentItem.status !== "COMPLETED";

  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.inquiry.update({
      where: { id },
      data,
      include: {
        assignedAdmin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            isActive: true,
            isSuperAdmin: true,
            isAssistantAdmin: true,
          },
        },
      },
    });

    if (shouldLogCompletion) {
      await tx.inquiryCompletionLog.create({
        data: {
          inquiryId: id,
          adminUserId: admin.id,
          adminUsername: admin.username,
          adminDisplayName: admin.displayName,
        },
      });
    }

    if (assignmentChanged) {
      await tx.inquiryAssignmentLog.create({
        data: {
          inquiryId: id,
          adminUserId: admin.id,
          adminUsername: admin.username,
          adminDisplayName: admin.displayName,
          assignedAdminId: nextAssignedAdminId,
          assignedAdminDisplayName: nextAssignedAdminDisplayName,
        },
      });
    }

    return updated;
  });

  if (assignmentChanged && nextAssignedAdminId) {
    try {
      await sendInquiryAssignmentPush(
        item.id,
        nextAssignedAdminId,
        item.companyName || "회사명 미입력",
      );
    } catch (error) {
      console.error("Inquiry assignment push notification failed:", error);
    }
  }

  return NextResponse.json({ success: true, item });
}
