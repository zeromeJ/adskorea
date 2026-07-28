import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);

  if (!admin) return unauthorizedResponse();
  if (!admin.isSuperAdmin) return forbiddenResponse();

  const { id } = await context.params;
  const body = (await request.json()) as {
    password?: string;
    displayName?: string;
  };
  const hasPassword = Object.prototype.hasOwnProperty.call(body, "password");
  const hasDisplayName = Object.prototype.hasOwnProperty.call(
    body,
    "displayName",
  );

  if (!hasPassword && !hasDisplayName) {
    return NextResponse.json(
      { success: false, message: "변경할 정보를 입력해 주세요." },
      { status: 400 },
    );
  }

  const password = hasPassword ? body.password || "" : null;
  const displayName = hasDisplayName ? body.displayName?.trim() || "" : null;

  if (password !== null && (password.length < 8 || password.length > 100)) {
    return NextResponse.json(
      { success: false, message: "새 비밀번호는 8자 이상 입력해 주세요." },
      { status: 400 },
    );
  }

  if (
    displayName !== null &&
    (displayName.length < 1 || displayName.length > 50)
  ) {
    return NextResponse.json(
      { success: false, message: "표시 이름은 1~50자로 입력해 주세요." },
      { status: 400 },
    );
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json(
      { success: false, message: "관리자를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const item = await prisma.adminUser.update({
    where: { id },
    data: {
      ...(password !== null
        ? { passwordHash: await bcrypt.hash(password, 12) }
        : {}),
      ...(displayName !== null ? { displayName } : {}),
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      isActive: true,
      isSuperAdmin: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, item });
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);

  if (!admin) return unauthorizedResponse();
  if (!admin.isSuperAdmin) return forbiddenResponse();

  const { id } = await context.params;
  const target = await prisma.adminUser.findUnique({ where: { id } });

  if (!target) {
    return NextResponse.json(
      { success: false, message: "관리자를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (target.id === admin.id || target.isSuperAdmin) {
    return forbiddenResponse("최고 관리자 계정은 삭제할 수 없습니다.");
  }

  await prisma.$transaction([
    prisma.inquiry.updateMany({
      where: { assignedAdminId: id },
      data: { assignedAdminId: null, assignedAt: null },
    }),
    prisma.adminUser.delete({ where: { id } }),
  ]);
  return NextResponse.json({ success: true });
}
