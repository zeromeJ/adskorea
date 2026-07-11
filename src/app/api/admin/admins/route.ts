import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) return unauthorizedResponse();
  if (!admin.isSuperAdmin) return forbiddenResponse();

  const items = await prisma.adminUser.findMany({
    orderBy: [{ isSuperAdmin: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      username: true,
      displayName: true,
      isActive: true,
      isSuperAdmin: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, items });
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) return unauthorizedResponse();
  if (!admin.isSuperAdmin) return forbiddenResponse();

  const body = (await request.json()) as {
    username?: string;
    password?: string;
    displayName?: string;
  };
  const username = body.username?.trim() || "";
  const password = body.password || "";
  const displayName = body.displayName?.trim() || "";

  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
    return NextResponse.json(
      { success: false, message: "아이디는 영문, 숫자, ._- 조합 3~30자로 입력해 주세요." },
      { status: 400 },
    );
  }

  if (password.length < 8 || password.length > 100) {
    return NextResponse.json(
      { success: false, message: "비밀번호는 8자 이상 입력해 주세요." },
      { status: 400 },
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json(
      { success: false, message: "이미 사용 중인 아이디입니다." },
      { status: 409 },
    );
  }

  const item = await prisma.adminUser.create({
    data: {
      username,
      passwordHash: await bcrypt.hash(password, 12),
      displayName: displayName || null,
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

  return NextResponse.json({ success: true, item }, { status: 201 });
}
