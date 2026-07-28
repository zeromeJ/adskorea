import { NextResponse } from "next/server";
import {
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { customerVisibilityWhere } from "@/lib/admin/customerAccess";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  const { id } = await context.params;
  const body = (await request.json()) as { favorite?: boolean };

  const customer = await prisma.customer.findFirst({
    where: { id, ...customerVisibilityWhere(admin) },
    select: { id: true },
  });
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "고객을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (body.favorite === true) {
    await prisma.customerFavorite.upsert({
      where: {
        adminUserId_customerId: {
          adminUserId: admin.id,
          customerId: id,
        },
      },
      create: { adminUserId: admin.id, customerId: id },
      update: {},
    });
  } else {
    await prisma.customerFavorite.deleteMany({
      where: { adminUserId: admin.id, customerId: id },
    });
  }

  return NextResponse.json({ success: true });
}
