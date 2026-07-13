import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type AdminTokenPayload = {
  adminId: string;
  username: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing.");
  }

  return secret;
}

export function signAdminToken(payload: AdminTokenPayload) {
  // TODO: For production, consider httpOnly cookie auth for web admin.
  // The app stores this token in platform secure storage. Disabled or deleted
  // administrator accounts are still rejected on every authenticated request.
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "3650d" });
}

export async function getAdminFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as AdminTokenPayload;

    const admin = await prisma.adminUser.findFirst({
      where: {
        id: payload.adminId,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        isSuperAdmin: true,
      },
    });

    return admin;
  } catch {
    return null;
  }
}

export function forbiddenResponse(message = "최고 관리자 권한이 필요합니다.") {
  return NextResponse.json(
    { success: false, message },
    { status: 403 },
  );
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: "인증이 필요합니다." },
    { status: 401 },
  );
}
