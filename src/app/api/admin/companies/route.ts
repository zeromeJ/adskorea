import { NextResponse } from "next/server";
import {
  canManageInquiries,
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { companyVisibilityWhere } from "@/lib/admin/customerAccess";
import { normalizeCompanyName } from "@/lib/customerNormalization";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";

  const items = await prisma.company.findMany({
    where: {
      ...companyVisibilityWhere(admin),
      ...(search
        ? { name: { contains: search, mode: "insensitive" } }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 50,
    select: {
      id: true,
      name: true,
      _count: { select: { customers: true } },
    },
  });

  return NextResponse.json({
    success: true,
    items: items.map(({ _count, ...company }) => ({
      ...company,
      customerCount: _count.customers,
    })),
  });
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!canManageInquiries(admin)) {
    return forbiddenResponse("회사 추가는 최고 또는 보조 관리자만 가능합니다.");
  }
  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim() || "";
  const normalizedName = normalizeCompanyName(name);
  if (!name || !normalizedName) {
    return NextResponse.json(
      { success: false, message: "회사명을 입력해 주세요." },
      { status: 400 },
    );
  }

  const existing = await prisma.company.findUnique({
    where: { normalizedName },
    select: { id: true, name: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        success: false,
        message: `같은 이름의 회사가 있습니다: ${existing.name}`,
        existing,
      },
      { status: 409 },
    );
  }
  const item = await prisma.company.create({
    data: { name, normalizedName },
    select: { id: true, name: true },
  });
  return NextResponse.json({ success: true, item });
}
