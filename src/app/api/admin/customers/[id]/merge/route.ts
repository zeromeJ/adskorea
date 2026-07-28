import { NextResponse } from "next/server";
import {
  canManageInquiries,
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import {
  CustomerMergeError,
  performCustomerMerge,
} from "@/lib/admin/customerMerge";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!canManageInquiries(admin)) {
    return forbiddenResponse(
      "고객 병합은 최고 관리자 또는 보조 관리자만 가능합니다.",
    );
  }

  const { id: sourceCustomerId } = await context.params;
  const body = (await request.json()) as { targetCustomerId?: string };
  const targetCustomerId = body.targetCustomerId?.trim() || "";
  if (!targetCustomerId || targetCustomerId === sourceCustomerId) {
    return NextResponse.json(
      { success: false, message: "병합할 후보 고객을 다시 선택해 주세요." },
      { status: 400 },
    );
  }

  try {
    const result = await performCustomerMerge(
      sourceCustomerId,
      targetCustomerId,
      admin,
    );
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof CustomerMergeError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    throw error;
  }
}
