import { NextResponse } from "next/server";
import {
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!admin.isSuperAdmin) return forbiddenResponse();

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 100);
  const type = searchParams.get("type");
  const offset = (page - 1) * limit;

  if (type === "COMPLETED") {
    const [completionItems, total] = await Promise.all([
      prisma.inquiryCompletionLog.findMany({
        orderBy: { completedAt: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          adminUsername: true,
          adminDisplayName: true,
          completedAt: true,
          inquiry: {
            select: {
              id: true,
              registrationNumber: true,
              companyName: true,
              contactPerson: true,
            },
          },
        },
      }),
      prisma.inquiryCompletionLog.count(),
    ]);

    return NextResponse.json({
      success: true,
      items: completionItems.map((item) => ({
        id: item.id,
        type: "COMPLETED" as const,
        adminUsername: item.adminUsername,
        adminDisplayName: item.adminDisplayName,
        assignedAdminId: null,
        assignedAdminDisplayName: null,
        occurredAt: item.completedAt,
        inquiry: item.inquiry,
      })),
      total,
    });
  }

  if (type === "ASSIGNMENT") {
    const [assignmentItems, total] = await Promise.all([
      prisma.inquiryAssignmentLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          adminUsername: true,
          adminDisplayName: true,
          assignedAdminId: true,
          assignedAdminDisplayName: true,
          createdAt: true,
          inquiry: {
            select: {
              id: true,
              registrationNumber: true,
              companyName: true,
              contactPerson: true,
            },
          },
        },
      }),
      prisma.inquiryAssignmentLog.count(),
    ]);

    return NextResponse.json({
      success: true,
      items: assignmentItems.map((item) => ({
        id: item.id,
        type: item.assignedAdminId
          ? ("ASSIGNED" as const)
          : ("UNASSIGNED" as const),
        adminUsername: item.adminUsername,
        adminDisplayName: item.adminDisplayName,
        assignedAdminId: item.assignedAdminId,
        assignedAdminDisplayName: item.assignedAdminDisplayName,
        occurredAt: item.createdAt,
        inquiry: item.inquiry,
      })),
      total,
    });
  }

  const take = page * limit;
  const [completionItems, assignmentItems, completionTotal, assignmentTotal] =
    await Promise.all([
    prisma.inquiryCompletionLog.findMany({
      orderBy: { completedAt: "desc" },
      take,
      select: {
        id: true,
        adminUsername: true,
        adminDisplayName: true,
        completedAt: true,
        inquiry: {
          select: {
            id: true,
            registrationNumber: true,
            companyName: true,
            contactPerson: true,
          },
        },
      },
    }),
    prisma.inquiryAssignmentLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        adminUsername: true,
        adminDisplayName: true,
        assignedAdminId: true,
        assignedAdminDisplayName: true,
        createdAt: true,
        inquiry: {
          select: {
            id: true,
            registrationNumber: true,
            companyName: true,
            contactPerson: true,
          },
        },
      },
    }),
    prisma.inquiryCompletionLog.count(),
    prisma.inquiryAssignmentLog.count(),
  ]);

  const items = [
    ...completionItems.map((item) => ({
      id: item.id,
      type: "COMPLETED" as const,
      adminUsername: item.adminUsername,
      adminDisplayName: item.adminDisplayName,
      assignedAdminId: null,
      assignedAdminDisplayName: null,
      occurredAt: item.completedAt,
      inquiry: item.inquiry,
    })),
    ...assignmentItems.map((item) => ({
      id: item.id,
      type: item.assignedAdminId
        ? ("ASSIGNED" as const)
        : ("UNASSIGNED" as const),
      adminUsername: item.adminUsername,
      adminDisplayName: item.adminDisplayName,
      assignedAdminId: item.assignedAdminId,
      assignedAdminDisplayName: item.assignedAdminDisplayName,
      occurredAt: item.createdAt,
      inquiry: item.inquiry,
    })),
  ]
    .sort(
      (left, right) =>
        right.occurredAt.getTime() - left.occurredAt.getTime(),
    )
    .slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    success: true,
    items,
    total: completionTotal + assignmentTotal,
  });
}
