import { InquiryStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const item = await prisma.inquiry.findUnique({
    where: { id },
  });

  if (!item) {
    return NextResponse.json(
      { success: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, item });
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
  };

  const data: {
    status?: InquiryStatus;
    adminMemo?: string | null;
  } = {};

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

  const currentItem = await prisma.inquiry.findUnique({ where: { id } });

  if (!currentItem) {
    return NextResponse.json(
      { success: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const shouldLogCompletion =
    data.status === "COMPLETED" && currentItem.status !== "COMPLETED";

  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.inquiry.update({
      where: { id },
      data,
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

    return updated;
  });

  return NextResponse.json({ success: true, item });
}
