import { NextResponse } from "next/server";
import {
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
      privateMemos: {
        where: { adminUserId: admin.id },
        select: { memo: true },
        take: 1,
      },
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
      companyChangeLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          previousCompanyName: true,
          newCompanyName: true,
          adminDisplayName: true,
          adminUsername: true,
          createdAt: true,
        },
      },
      ...(admin.isSuperAdmin
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
  const pendingDuplicateCount = await prisma.customerDuplicateReview.count({
    where: {
      newCustomerId: id,
      status: "PENDING",
      candidateCustomer: { isArchived: false },
    },
  });
  const {
    privateMemos,
    ...customerWithoutPrivateMemoList
  } = customer;
  return NextResponse.json({
    success: true,
    item: {
      ...customerWithoutPrivateMemoList,
      isFavorite: favorites.length > 0,
      privateMemo: privateMemos[0]?.memo ?? null,
      hasPendingDuplicate: pendingDuplicateCount > 0,
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  const { id } = await context.params;
  const body = (await request.json()) as {
    name?: unknown;
    memo?: string;
    memoVisibility?: "SHARED" | "PRIVATE";
  };

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

  const hasName = Object.prototype.hasOwnProperty.call(body, "name");
  const hasMemo = typeof body.memo === "string";
  if (!hasName && !hasMemo) {
    return NextResponse.json(
      { success: false, message: "변경할 고객 정보를 입력해 주세요." },
      { status: 400 },
    );
  }

  if (hasName) {
    if (typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, message: "고객명을 다시 입력해 주세요." },
        { status: 400 },
      );
    }
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json(
        { success: false, message: "고객명을 입력해 주세요." },
        { status: 400 },
      );
    }
    if (name.length > 80) {
      return NextResponse.json(
        { success: false, message: "고객명은 80자 이내로 입력해 주세요." },
        { status: 400 },
      );
    }
    await prisma.customer.update({
      where: { id },
      data: { name },
    });
  }

  if (hasMemo) {
    const memo = body.memo!.trim();
    if (body.memoVisibility === "PRIVATE") {
      if (memo) {
        await prisma.customerPrivateMemo.upsert({
          where: {
            customerId_adminUserId: {
              customerId: id,
              adminUserId: admin.id,
            },
          },
          create: { customerId: id, adminUserId: admin.id, memo },
          update: { memo },
        });
      } else {
        await prisma.customerPrivateMemo.deleteMany({
          where: { customerId: id, adminUserId: admin.id },
        });
      }
    } else {
      await prisma.customer.update({
        where: { id },
        data: { memo: memo || null },
      });
    }
  }
  return NextResponse.json({ success: true });
}
