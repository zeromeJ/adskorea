import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) return unauthorizedResponse();

  const body = (await request.json()) as {
    token?: string;
    platform?: string;
  };
  const token = body.token?.trim();

  if (!token || token.length > 4096) {
    return NextResponse.json(
      { success: false, message: "유효한 기기 토큰이 필요합니다." },
      { status: 400 },
    );
  }

  await prisma.adminDevice.upsert({
    where: { token },
    create: {
      token,
      adminUserId: admin.id,
      platform: body.platform?.trim() || null,
    },
    update: {
      adminUserId: admin.id,
      platform: body.platform?.trim() || null,
    },
  });

  return NextResponse.json({ success: true });
}
