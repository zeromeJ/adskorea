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
  const body = (await request.json()) as { password?: string };
  const password = body.password || "";

  if (password.length < 8 || password.length > 100) {
    return NextResponse.json(
      { success: false, message: "새 비밀번호는 8자 이상 입력해 주세요." },
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

  await prisma.adminUser.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });

  return NextResponse.json({ success: true });
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

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
