import { NextResponse } from "next/server";
import {
  canManageInquiries,
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) return unauthorizedResponse();
  if (!canManageInquiries(admin)) {
    return forbiddenResponse("문의 담당자를 배정할 권한이 없습니다.");
  }

  const items = await prisma.adminUser.findMany({
    where: { isActive: true },
    orderBy: [
      { isSuperAdmin: "desc" },
      { isAssistantAdmin: "desc" },
      { displayName: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      displayName: true,
      isActive: true,
      isSuperAdmin: true,
      isAssistantAdmin: true,
    },
  });

  return NextResponse.json({ success: true, items });
}
