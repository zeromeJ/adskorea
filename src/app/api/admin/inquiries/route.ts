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

  const where: Prisma.InquiryWhereInput = {
    ...(status === "ALL" ? {} : { status: status as InquiryStatus }),
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

  const [items, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: [{ status: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        email: true,
        phone: true,
        industry: true,
        productInterest: true,
        estimatedQuantity: true,
        exportCountry: true,
        message: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.inquiry.count({ where }),
  ]);

  return NextResponse.json({ success: true, items, total });
}
