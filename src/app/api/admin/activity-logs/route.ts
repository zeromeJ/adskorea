import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 100);

  const [items, total] = await Promise.all([
    prisma.inquiryCompletionLog.findMany({
      orderBy: { completedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        adminUsername: true,
        adminDisplayName: true,
        completedAt: true,
        inquiry: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
          },
        },
      },
    }),
    prisma.inquiryCompletionLog.count(),
  ]);

  return NextResponse.json({ success: true, items, total });
}
