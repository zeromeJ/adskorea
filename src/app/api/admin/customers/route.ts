import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  canManageInquiries,
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { customerVisibilityWhere } from "@/lib/admin/customerAccess";
import { normalizePhone } from "@/lib/customerNormalization";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "ALL";
  if (filter === "DUPLICATES" && !admin.isSuperAdmin) {
    return forbiddenResponse("중복 고객 검토는 최고 관리자만 이용할 수 있습니다.");
  }

  const search = searchParams.get("search")?.trim() || "";
  const normalizedSearchPhone = normalizePhone(search);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 100);
  const where: Prisma.CustomerWhereInput = {
    AND: [
      customerVisibilityWhere(admin),
      filter === "FAVORITES"
        ? { favorites: { some: { adminUserId: admin.id } } }
        : {},
      filter === "DUPLICATES"
        ? {
            duplicateReviews: {
              some: { status: "PENDING" },
            },
          }
        : {},
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              {
                company: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
              ...(normalizedSearchPhone
                ? [
                    {
                      normalizedPhone: {
                        contains: normalizedSearchPhone,
                      },
                    } satisfies Prisma.CustomerWhereInput,
                  ]
                : []),
            ],
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        memo: true,
        createdAt: true,
        company: { select: { id: true, name: true } },
        favorites: {
          where: { adminUserId: admin.id },
          select: { adminUserId: true },
        },
        duplicateReviews: {
          where: { status: "PENDING" },
          select: { id: true },
        },
        _count: {
          select: {
            inquiries: canManageInquiries(admin)
              ? true
              : { where: { assignedAdminId: admin.id } },
          },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    items: items.map(({ favorites, duplicateReviews, _count, ...item }) => ({
      ...item,
      isFavorite: favorites.length > 0,
      hasPendingDuplicate: duplicateReviews.length > 0,
      inquiryCount: _count.inquiries,
    })),
    total,
  });
}
