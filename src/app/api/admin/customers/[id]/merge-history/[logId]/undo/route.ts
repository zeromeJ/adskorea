import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  forbiddenResponse,
  getAdminFromRequest,
  unauthorizedResponse,
} from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string; logId: string }>;
};

type OriginalReview = {
  newCustomerId: string;
  candidateCustomerId: string;
  matchedPhone: boolean;
  matchedEmail: boolean;
  matchedCompany: boolean;
};

type TargetReviewAction = {
  otherCustomerId: string;
  action: "CREATED" | "UPDATED" | "SKIPPED";
  previousMatchedPhone?: boolean;
  previousMatchedEmail?: boolean;
  previousMatchedCompany?: boolean;
};

type ReviewSnapshot = {
  originalReviews: OriginalReview[];
  targetReviewActions: TargetReviewAction[];
};

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return unauthorizedResponse();
  if (!admin.isSuperAdmin) {
    return forbiddenResponse("고객 병합 되돌리기는 최고 관리자만 가능합니다.");
  }

  const { id: targetCustomerId, logId } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const mergeLog = await tx.customerMergeLog.findFirst({
        where: { id: logId, targetCustomerId },
        select: {
          id: true,
          sourceCustomerId: true,
          targetCustomerId: true,
          undoneAt: true,
          transferredReviews: true,
          addedFavoriteAdminIds: true,
          sourceCustomer: {
            select: {
              id: true,
              isArchived: true,
              mergedIntoCustomerId: true,
              normalizedPhone: true,
              normalizedEmail: true,
              companyId: true,
            },
          },
          targetCustomer: {
            select: {
              id: true,
              isArchived: true,
              normalizedPhone: true,
              normalizedEmail: true,
              companyId: true,
            },
          },
          movedInquiries: {
            select: {
              inquiryId: true,
              inquiry: { select: { customerId: true } },
            },
          },
        },
      });

      if (!mergeLog) {
        throw new UndoError("병합 기록을 찾을 수 없습니다.", 404);
      }
      if (mergeLog.undoneAt) {
        throw new UndoError("이미 되돌린 병합 기록입니다.", 409);
      }
      if (
        !mergeLog.sourceCustomer.isArchived ||
        mergeLog.sourceCustomer.mergedIntoCustomerId !== targetCustomerId
      ) {
        throw new UndoError(
          "고객 상태가 변경되어 이 병합을 바로 되돌릴 수 없습니다.",
          409,
        );
      }
      if (mergeLog.targetCustomer.isArchived) {
        throw new UndoError(
          "기준 고객이 다른 고객에 병합되어 먼저 해당 병합을 되돌려야 합니다.",
          409,
        );
      }
      if (
        mergeLog.movedInquiries.some(
          (record) => record.inquiry.customerId !== targetCustomerId,
        )
      ) {
        throw new UndoError(
          "병합된 문의 중 일부의 고객 연결이 변경되어 되돌릴 수 없습니다.",
          409,
        );
      }

      const snapshot = parseReviewSnapshot(mergeLog.transferredReviews);

      await tx.customer.update({
        where: { id: mergeLog.sourceCustomerId },
        data: {
          isArchived: false,
          mergedIntoCustomerId: null,
        },
      });
      await tx.inquiry.updateMany({
        where: {
          id: {
            in: mergeLog.movedInquiries.map((record) => record.inquiryId),
          },
          customerId: targetCustomerId,
        },
        data: { customerId: mergeLog.sourceCustomerId },
      });

      if (mergeLog.addedFavoriteAdminIds.length > 0) {
        await tx.customerFavorite.deleteMany({
          where: {
            customerId: targetCustomerId,
            adminUserId: { in: mergeLog.addedFavoriteAdminIds },
          },
        });
      }

      for (const action of snapshot.targetReviewActions) {
        const uniqueWhere = {
          newCustomerId_candidateCustomerId: {
            newCustomerId: targetCustomerId,
            candidateCustomerId: action.otherCustomerId,
          },
        };
        if (action.action === "CREATED") {
          await tx.customerDuplicateReview.deleteMany({
            where: {
              newCustomerId: targetCustomerId,
              candidateCustomerId: action.otherCustomerId,
              status: "PENDING",
            },
          });
        } else if (action.action === "UPDATED") {
          const existing = await tx.customerDuplicateReview.findUnique({
            where: uniqueWhere,
            select: { id: true, status: true },
          });
          if (existing?.status === "PENDING") {
            await tx.customerDuplicateReview.update({
              where: { id: existing.id },
              data: {
                matchedPhone: action.previousMatchedPhone ?? false,
                matchedEmail: action.previousMatchedEmail ?? false,
                matchedCompany: action.previousMatchedCompany ?? false,
              },
            });
          }
        }
      }

      for (const original of snapshot.originalReviews) {
        const [newCustomer, candidateCustomer] = await Promise.all([
          tx.customer.findUnique({
            where: { id: original.newCustomerId },
            select: { isArchived: true },
          }),
          tx.customer.findUnique({
            where: { id: original.candidateCustomerId },
            select: { isArchived: true },
          }),
        ]);
        if (
          !newCustomer ||
          !candidateCustomer ||
          newCustomer.isArchived ||
          candidateCustomer.isArchived
        ) {
          continue;
        }

        const existing = await tx.customerDuplicateReview.findUnique({
          where: {
            newCustomerId_candidateCustomerId: {
              newCustomerId: original.newCustomerId,
              candidateCustomerId: original.candidateCustomerId,
            },
          },
          select: { id: true, status: true },
        });
        if (!existing) {
          await tx.customerDuplicateReview.create({
            data: original,
          });
        } else if (existing.status === "PENDING") {
          await tx.customerDuplicateReview.update({
            where: { id: existing.id },
            data: {
              matchedPhone: original.matchedPhone,
              matchedEmail: original.matchedEmail,
              matchedCompany: original.matchedCompany,
            },
          });
        }
      }

      const hasOriginalBaselineReview = snapshot.originalReviews.some(
        (review) =>
          (review.newCustomerId === targetCustomerId &&
            review.candidateCustomerId === mergeLog.sourceCustomerId) ||
          (review.newCustomerId === mergeLog.sourceCustomerId &&
            review.candidateCustomerId === targetCustomerId),
      );
      if (!hasOriginalBaselineReview) {
        const matchedPhone =
          Boolean(mergeLog.sourceCustomer.normalizedPhone) &&
          mergeLog.sourceCustomer.normalizedPhone ===
            mergeLog.targetCustomer.normalizedPhone;
        const matchedEmail =
          Boolean(mergeLog.sourceCustomer.normalizedEmail) &&
          mergeLog.sourceCustomer.normalizedEmail ===
            mergeLog.targetCustomer.normalizedEmail;
        const matchedCompany =
          Boolean(mergeLog.sourceCustomer.companyId) &&
          mergeLog.sourceCustomer.companyId ===
            mergeLog.targetCustomer.companyId;
        if (matchedPhone || matchedEmail || matchedCompany) {
          const existing = await tx.customerDuplicateReview.findUnique({
            where: {
              newCustomerId_candidateCustomerId: {
                newCustomerId: targetCustomerId,
                candidateCustomerId: mergeLog.sourceCustomerId,
              },
            },
            select: { id: true, status: true },
          });
          if (!existing) {
            await tx.customerDuplicateReview.create({
              data: {
                newCustomerId: targetCustomerId,
                candidateCustomerId: mergeLog.sourceCustomerId,
                matchedPhone,
                matchedEmail,
                matchedCompany,
              },
            });
          } else if (existing.status === "PENDING") {
            await tx.customerDuplicateReview.update({
              where: { id: existing.id },
              data: { matchedPhone, matchedEmail, matchedCompany },
            });
          }
        }
      }

      await tx.customerMergeLog.update({
        where: { id: mergeLog.id },
        data: {
          undoneAt: new Date(),
          undoneByAdminId: admin.id,
          undoneByDisplayName: admin.displayName || admin.username,
        },
      });

      return { restoredInquiryCount: mergeLog.movedInquiries.length };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof UndoError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    throw error;
  }
}

function parseReviewSnapshot(value: Prisma.JsonValue): ReviewSnapshot {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return { originalReviews: [], targetReviewActions: [] };
  }
  const object = value as Record<string, Prisma.JsonValue>;
  return {
    originalReviews: Array.isArray(object.originalReviews)
      ? (object.originalReviews as unknown as OriginalReview[])
      : [],
    targetReviewActions: Array.isArray(object.targetReviewActions)
      ? (object.targetReviewActions as unknown as TargetReviewAction[])
      : [],
  };
}

class UndoError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
