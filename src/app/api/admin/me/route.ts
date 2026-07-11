import { NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin/auth";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return unauthorizedResponse();
  }

  return NextResponse.json({
    success: true,
    admin: {
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName || "관리자",
      isSuperAdmin: admin.isSuperAdmin,
    },
  });
}
