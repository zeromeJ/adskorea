import { InquiryStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  canManageInquiries,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { inquiryVisibilityWhere } from "@/lib/admin/inquiryAccess";
import { prisma } from "@/lib/prisma";

function parseScope(scope: string | null, canManageAll: boolean) {
  if (!canManageAll) return "MINE";
  return scope === "MINE" ? "MINE" : "ALL";
}

function parseStatus(status: string | null, canViewUnassigned: boolean) {
  if (status === "UNASSIGNED" && canViewUnassigned) {
    return status;
  }

  if (
    status === "PENDING" ||
    status === "COMPLETED" ||
    status === "STALE_ALL" ||
    status === "STALE_1D" ||
    status === "STALE_3D"
  ) {
    return status;
  }

  return "ALL";
}

const inquiryListSelect = {
  id: true,
  registrationNumber: true,
  companyName: true,
  contactPerson: true,
  email: true,
  phone: true,
  responseMethod: true,
  inquiryType: true,
  department: true,
  inquiryDetails: true,
  industry: true,
  productInterest: true,
  cargoType: true,
  loadPerPallet: true,
  estimatedQuantity: true,
  requiredPalletSize: true,
  requestedPalletSizes: true,
  exportCountry: true,
  rackStorage: true,
  automationUse: true,
  forkliftUse: true,
  handPalletTruckUse: true,
  message: true,
  status: true,
  assignedAdminId: true,
  assignedAt: true,
  lastActionAt: true,
  assignedAdmin: {
    select: {
      id: true,
      username: true,
      displayName: true,
      isActive: true,
      isSuperAdmin: true,
      isAssistantAdmin: true,
    },
  },
  customer: {
    select: {
      duplicateReviews: {
        where: {
          status: "PENDING",
          candidateCustomer: { isArchived: false },
        },
        take: 1,
        select: { id: true },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.InquirySelect;

type InquiryListItem = Prisma.InquiryGetPayload<{
  select: typeof inquiryListSelect;
}>;

function serializeInquiryListItem(
  item: InquiryListItem,
  showDuplicateDetection: boolean,
) {
  const { customer, ...inquiry } = item;
  return {
    ...inquiry,
    hasPendingDuplicate:
      showDuplicateDetection && customer.duplicateReviews.length > 0,
  };
}

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const hasInquiryManagementPermission = canManageInquiries(admin);
  const scope = parseScope(
    searchParams.get("scope"),
    hasInquiryManagementPermission,
  );
  const canViewUnassigned =
    hasInquiryManagementPermission && scope === "ALL";
  const status = parseStatus(searchParams.get("status"), canViewUnassigned);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 30), 1), 100);
  const search = searchParams.get("search")?.trim();

  const baseWhere: Prisma.InquiryWhereInput = {
    ...(scope === "MINE"
      ? { assignedAdminId: admin.id }
      : inquiryVisibilityWhere(admin)),
    ...(search
      ? {
          OR: [
            {
              registrationNumber: {
                contains: search,
                mode: "insensitive",
              },
            },
            { companyName: { contains: search, mode: "insensitive" } },
            { contactPerson: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const now = Date.now();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now - 72 * 60 * 60 * 1000);

  const where: Prisma.InquiryWhereInput = {
    ...baseWhere,
    ...(status === "UNASSIGNED"
      ? {
          status: InquiryStatus.PENDING,
          assignedAdminId: null,
        }
      : status === "PENDING"
        ? {
            status: InquiryStatus.PENDING,
            ...(canViewUnassigned
              ? { assignedAdminId: { not: null } }
              : {}),
          }
        : status === "COMPLETED"
          ? { status: InquiryStatus.COMPLETED }
          : status === "STALE_ALL"
            ? {
                status: InquiryStatus.PENDING,
                lastActionAt: { lte: oneDayAgo },
              }
          : status === "STALE_1D"
            ? {
                status: InquiryStatus.PENDING,
                lastActionAt: { gt: threeDaysAgo, lte: oneDayAgo },
              }
            : status === "STALE_3D"
              ? {
                  status: InquiryStatus.PENDING,
                  lastActionAt: { lte: threeDaysAgo },
                }
          : {}),
  };

  const visibilityWhere = inquiryVisibilityWhere(admin);
  const countsPromise = Promise.all([
    prisma.inquiry.count({ where: baseWhere }),
    canViewUnassigned
      ? prisma.inquiry.count({
          where: {
            ...baseWhere,
            status: InquiryStatus.PENDING,
            assignedAdminId: null,
          },
        })
      : Promise.resolve(0),
    prisma.inquiry.count({
      where: {
        ...baseWhere,
        status: InquiryStatus.PENDING,
        ...(canViewUnassigned
          ? { assignedAdminId: { not: null } }
          : {}),
      },
    }),
    prisma.inquiry.count({
      where: {
        ...baseWhere,
        status: InquiryStatus.COMPLETED,
      },
    }),
  ]).then(([all, unassigned, pending, completed]) => ({
    all,
    unassigned,
    pending,
    completed,
  }));
  const summaryPromise = Promise.all([
    hasInquiryManagementPermission
      ? prisma.inquiry.count({
          where: {
            ...visibilityWhere,
            status: InquiryStatus.PENDING,
            assignedAdminId: null,
          },
        })
      : Promise.resolve(0),
    prisma.inquiry.count({
      where: {
        ...visibilityWhere,
        status: InquiryStatus.PENDING,
        lastActionAt: { gt: threeDaysAgo, lte: oneDayAgo },
      },
    }),
    prisma.inquiry.count({
      where: {
        ...visibilityWhere,
        status: InquiryStatus.PENDING,
        lastActionAt: { lte: threeDaysAgo },
      },
    }),
    prisma.inquiry.count({
      where: {
        assignedAdminId: admin.id,
        status: InquiryStatus.PENDING,
      },
    }),
    prisma.inquiry.count({
      where: {
        assignedAdminId: admin.id,
      },
    }),
  ]).then(([unassigned, stale1d, stale3d, minePending, mineAll]) => ({
    unassigned,
    stale1d,
    stale3d,
    staleTotal: stale1d + stale3d,
    minePending,
    mineAll,
  }));

  const [rankedRows, total, counts, summary] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      select: {
        id: true,
        status: true,
        assignedAdminId: true,
        lastActionAt: true,
        createdAt: true,
      },
    }),
    prisma.inquiry.count({ where }),
    countsPromise,
    summaryPromise,
  ]);

  rankedRows.sort((left, right) => {
    const priority = (item: (typeof rankedRows)[number]) => {
      if (item.status === InquiryStatus.COMPLETED) return 4;
      if (item.lastActionAt <= threeDaysAgo) return 0;
      if (item.lastActionAt <= oneDayAgo) return 1;
      if (item.assignedAdminId === null) return 2;
      return 3;
    };
    const priorityOrder = priority(left) - priority(right);
    if (priorityOrder !== 0) return priorityOrder;
    return left.status === InquiryStatus.COMPLETED
      ? right.createdAt.getTime() - left.createdAt.getTime()
      : left.lastActionAt.getTime() - right.lastActionAt.getTime();
  });

  const offset = (page - 1) * limit;
  const orderedIds = rankedRows
    .slice(offset, offset + limit)
    .map((item) => item.id);
  const unorderedItems =
    orderedIds.length === 0
      ? []
      : await prisma.inquiry.findMany({
          where: { id: { in: orderedIds } },
          select: inquiryListSelect,
        });
  const itemById = new Map(unorderedItems.map((item) => [item.id, item]));
  const items = orderedIds.flatMap((id) => {
    const item = itemById.get(id);
    return item ? [item] : [];
  });

  return NextResponse.json({
    success: true,
    items: items.map((item) =>
      serializeInquiryListItem(item, admin.isSuperAdmin),
    ),
    total,
    counts,
    summary,
  });
}
