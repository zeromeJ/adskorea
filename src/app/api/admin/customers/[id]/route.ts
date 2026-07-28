import { NextResponse } from "next/server";
import {
  canManageInquiries,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import {
  customerVisibilityWhere,
  visibleInquiryWhere,
} from "@/lib/admin/customerAccess";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  const { id } = await context.params;

  const item = await prisma.customer.findFirst({
    where: { id, ...customerVisibilityWhere(admin) },
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
      inquiries: {
        where: visibleInquiryWhere(admin),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          registrationNumber: true,
          status: true,
          inquiryType: true,
          createdAt: true,
          assignedAdmin: {
            select: { id: true, displayName: true },
          },
        },
      },
      ...(canManageInquiries(admin)
        ? {
            duplicateReviews: {
              where: {
                status: "PENDING" as const,
                candidateCustomer: { isArchived: false },
              },
              orderBy: { createdAt: "desc" as const },
              select: {
                id: true,
                matchedPhone: true,
                matchedEmail: true,
                matchedCompany: true,
                candidateCustomer: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    company: { select: { id: true, name: true } },
                    inquiries: {
                      orderBy: { createdAt: "desc" as const },
                      select: {
                        id: true,
                        registrationNumber: true,
                        status: true,
                        createdAt: true,
                      },
                    },
                  },
                },
              },
            },
          }
        : {}),
      ...(admin.isSuperAdmin
        ? {
            mergeLogsAsTarget: {
              orderBy: { createdAt: "desc" as const },
              take: 50,
              select: {
                id: true,
                mergedByDisplayName: true,
                mergedByUsername: true,
                createdAt: true,
                undoneAt: true,
                undoneByDisplayName: true,
                sourceCustomer: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    company: { select: { id: true, name: true } },
                  },
                },
                movedInquiries: {
                  orderBy: { inquiry: { createdAt: "desc" as const } },
                  select: {
                    inquiry: {
                      select: {
                        id: true,
                        registrationNumber: true,
                        status: true,
                        inquiryType: true,
                        createdAt: true,
                      },
                    },
                  },
                },
              },
            },
          }
        : {}),
    },
  });

  if (!item) {
    return NextResponse.json(
      { success: false, message: "고객을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { favorites, ...customer } = item;
  return NextResponse.json({
    success: true,
    item: {
      ...customer,
      isFavorite: favorites.length > 0,
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  const { id } = await context.params;
  const body = (await request.json()) as { memo?: string };

  const existing = await prisma.customer.findFirst({
    where: { id, ...customerVisibilityWhere(admin) },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "고객을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  await prisma.customer.update({
    where: { id },
    data: { memo: body.memo?.trim() || null },
  });
  return NextResponse.json({ success: true });
}
