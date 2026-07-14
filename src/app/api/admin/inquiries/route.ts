import { InquiryStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

function parseStatus(status: string | null) {
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
  exportCountry: true,
  rackStorage: true,
  automationUse: true,
  forkliftUse: true,
  handPalletTruckUse: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.InquirySelect;

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const status = parseStatus(searchParams.get("status"));
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 30), 1), 100);
  const search = searchParams.get("search")?.trim();

  const baseWhere: Prisma.InquiryWhereInput = {
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
    ...(status === "ALL" ? {} : { status: status as InquiryStatus }),
  };

  const offset = (page - 1) * limit;

  if (status === "ALL") {
    const [pendingCount, total] = await Promise.all([
      prisma.inquiry.count({
        where: { ...baseWhere, status: InquiryStatus.PENDING },
      }),
      prisma.inquiry.count({ where: baseWhere }),
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
    });
  }

  const [items, total] = await Promise.all([
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
  ]);

  return NextResponse.json({ success: true, items, total });
}
