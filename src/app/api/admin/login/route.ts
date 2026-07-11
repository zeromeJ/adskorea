import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAdminToken } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const username = body.username?.trim() || "";
  const password = body.password || "";

  const admin = await prisma.adminUser.findFirst({
    where: {
      username,
      isActive: true,
    },
  });

  if (!admin) {
    return NextResponse.json(
      { success: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

  if (!isValidPassword) {
    return NextResponse.json(
      { success: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const token = signAdminToken({
    adminId: admin.id,
    username: admin.username,
  });

  return NextResponse.json({
    success: true,
    token,
    admin: {
      username: admin.username,
      displayName: admin.displayName || "관리자",
    },
  });
}
