import { InquiryStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { inquiryVisibilityWhere } from "@/lib/admin/inquiryAccess";
import { prisma } from "@/lib/prisma";

function parseStatus(status: string | null, isSuperAdmin: boolean) {
  if (status === "UNASSIGNED" && isSuperAdmin) {
    return status;
  }

  if (status === "PENDING" || status === "COMPLETED") {
    return status;
  }

  return "ALL";
}

const inquiryListSelect = {
  id: true,
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
  assignedAdmin: {
    select: {
      id: true,
      username: true,
      displayName: true,
      isActive: true,
      isSuperAdmin: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.InquirySelect;

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const status = parseStatus(searchParams.get("status"), admin.isSuperAdmin);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 30), 1), 100);
  const search = searchParams.get("search")?.trim();

  const baseWhere: Prisma.InquiryWhereInput = {
    ...inquiryVisibilityWhere(admin),
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" } },
            { contactPerson: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

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
            ...(admin.isSuperAdmin
              ? { assignedAdminId: { not: null } }
              : {}),
          }
        : status === "COMPLETED"
          ? { status: InquiryStatus.COMPLETED }
          : {}),
  };

  const offset = (page - 1) * limit;
  const countsPromise = Promise.all([
    prisma.inquiry.count({ where: baseWhere }),
    admin.isSuperAdmin
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
        ...(admin.isSuperAdmin
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

  if (status === "ALL") {
    const [pendingCount, total, counts] = await Promise.all([
      prisma.inquiry.count({
        where: { ...baseWhere, status: InquiryStatus.PENDING },
      }),
      prisma.inquiry.count({ where: baseWhere }),
      countsPromise,
    ]);

    const pendingTake = Math.max(Math.min(limit, pendingCount - offset), 0);
    const completedSkip = Math.max(offset - pendingCount, 0);
    const completedTake = limit - pendingTake;

    const [pendingItems, completedItems] = await Promise.all([
      pendingTake > 0
        ? prisma.inquiry.findMany({
            where: { ...baseWhere, status: InquiryStatus.PENDING },
            orderBy: { createdAt: "asc" },
            skip: offset,
            take: pendingTake,
            select: inquiryListSelect,
          })
        : Promise.resolve([]),
      completedTake > 0
        ? prisma.inquiry.findMany({
            where: { ...baseWhere, status: InquiryStatus.COMPLETED },
            orderBy: { createdAt: "desc" },
            skip: completedSkip,
            take: completedTake,
            select: inquiryListSelect,
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      success: true,
      items: [...pendingItems, ...completedItems],
      total,
      counts,
    });
  }

  const [items, total, counts] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: {
        createdAt: status === "COMPLETED" ? "desc" : "asc",
      },
      skip: offset,
      take: limit,
      select: inquiryListSelect,
    }),
    prisma.inquiry.count({ where }),
    countsPromise,
  ]);

  return NextResponse.json({ success: true, items, total, counts });
}
