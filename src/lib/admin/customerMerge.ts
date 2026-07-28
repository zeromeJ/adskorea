import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type MergeActor = {
  id: string;
  username: string;
  displayName: string | null;
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

export async function performCustomerMerge(
  sourceCustomerId: string,
  targetCustomerId: string,
  actor: MergeActor,
) {
  return prisma.$transaction(async (tx) => {
    const [source, target] = await Promise.all([
      tx.customer.findUnique({
        where: { id: sourceCustomerId },
        select: {
          id: true,
          isArchived: true,
          inquiries: { select: { id: true } },
          favorites: { select: { adminUserId: true } },
          mergeLogsAsTarget: {
            where: { undoneAt: null },
            take: 1,
            select: { id: true },
          },
        },
      }),
      tx.customer.findUnique({
        where: { id: targetCustomerId },
        select: {
          id: true,
          isArchived: true,
          favorites: { select: { adminUserId: true } },
        },
      }),
    ]);

    if (!source || !target) {
      throw new CustomerMergeError("병합할 고객을 찾을 수 없습니다.", 404);
    }
    if (source.isArchived || target.isArchived) {
      throw new CustomerMergeError(
        "이미 병합된 고객이 포함되어 있습니다. 화면을 새로고침해 주세요.",
        409,
      );
    }
    if (source.inquiries.length === 0) {
      throw new CustomerMergeError("후보 고객에게 이동할 문의가 없습니다.", 409);
    }
    if (source.mergeLogsAsTarget.length > 0) {
      throw new CustomerMergeError(
        "이 후보에는 이전 병합 기록이 있습니다. 해당 고객 화면에서 먼저 확인해 주세요.",
        409,
      );
    }

    const originalReviewRows = await tx.customerDuplicateReview.findMany({
      where: {
        status: "PENDING",
        OR: [
          { newCustomerId: sourceCustomerId },
          { candidateCustomerId: sourceCustomerId },
        ],
      },
      select: {
        newCustomerId: true,
        candidateCustomerId: true,
        matchedPhone: true,
        matchedEmail: true,
        matchedCompany: true,
      },
    });
    const originalReviews: OriginalReview[] = originalReviewRows;

    const matchesByOther = new Map<
      string,
      { phone: boolean; email: boolean; company: boolean }
    >();
    for (const review of originalReviews) {
      const otherCustomerId =
        review.newCustomerId === sourceCustomerId
          ? review.candidateCustomerId
          : review.newCustomerId;
      if (otherCustomerId === targetCustomerId) continue;
      const previous = matchesByOther.get(otherCustomerId) ?? {
        phone: false,
        email: false,
        company: false,
      };
      matchesByOther.set(otherCustomerId, {
        phone: previous.phone || review.matchedPhone,
        email: previous.email || review.matchedEmail,
        company: previous.company || review.matchedCompany,
      });
    }

    const targetReviewActions: TargetReviewAction[] = [];
    for (const [otherCustomerId, matches] of matchesByOther) {
      const other = await tx.customer.findUnique({
        where: { id: otherCustomerId },
        select: { isArchived: true },
      });
      if (!other || other.isArchived) {
        targetReviewActions.push({ otherCustomerId, action: "SKIPPED" });
        continue;
      }

      const existing = await tx.customerDuplicateReview.findUnique({
        where: {
          newCustomerId_candidateCustomerId: {
            newCustomerId: targetCustomerId,
            candidateCustomerId: otherCustomerId,
          },
        },
        select: {
          id: true,
          status: true,
          matchedPhone: true,
          matchedEmail: true,
          matchedCompany: true,
        },
      });

      if (!existing) {
        await tx.customerDuplicateReview.create({
          data: {
            newCustomerId: targetCustomerId,
            candidateCustomerId: otherCustomerId,
            matchedPhone: matches.phone,
            matchedEmail: matches.email,
            matchedCompany: matches.company,
          },
        });
        targetReviewActions.push({ otherCustomerId, action: "CREATED" });
      } else if (existing.status === "PENDING") {
        await tx.customerDuplicateReview.update({
          where: { id: existing.id },
          data: {
            matchedPhone: existing.matchedPhone || matches.phone,
            matchedEmail: existing.matchedEmail || matches.email,
            matchedCompany: existing.matchedCompany || matches.company,
          },
        });
        targetReviewActions.push({
          otherCustomerId,
          action: "UPDATED",
          previousMatchedPhone: existing.matchedPhone,
          previousMatchedEmail: existing.matchedEmail,
          previousMatchedCompany: existing.matchedCompany,
        });
      } else {
        targetReviewActions.push({ otherCustomerId, action: "SKIPPED" });
      }
    }

    const targetFavoriteIds = new Set(
      target.favorites.map((favorite) => favorite.adminUserId),
    );
    const addedFavoriteAdminIds = source.favorites
      .map((favorite) => favorite.adminUserId)
      .filter((adminUserId) => !targetFavoriteIds.has(adminUserId));

    const mergeLog = await tx.customerMergeLog.create({
      data: {
        sourceCustomerId,
        targetCustomerId,
        mergedByAdminId: actor.id,
        mergedByUsername: actor.username,
        mergedByDisplayName: actor.displayName,
        addedFavoriteAdminIds,
        transferredReviews: {
          version: 1,
          originalReviews,
          targetReviewActions,
        } satisfies Prisma.InputJsonValue,
        movedInquiries: {
          createMany: {
            data: source.inquiries.map((inquiry) => ({
              inquiryId: inquiry.id,
            })),
          },
        },
      },
      select: { id: true },
    });

    await tx.inquiry.updateMany({
      where: {
        id: { in: source.inquiries.map((inquiry) => inquiry.id) },
        customerId: sourceCustomerId,
      },
      data: { customerId: targetCustomerId },
    });

    if (addedFavoriteAdminIds.length > 0) {
      await tx.customerFavorite.createMany({
        data: addedFavoriteAdminIds.map((adminUserId) => ({
          adminUserId,
          customerId: targetCustomerId,
        })),
        skipDuplicates: true,
      });
    }

    await tx.customerDuplicateReview.deleteMany({
      where: {
        status: "PENDING",
        OR: [
          { newCustomerId: sourceCustomerId },
          { candidateCustomerId: sourceCustomerId },
        ],
      },
    });
    await tx.customer.update({
      where: { id: sourceCustomerId },
      data: {
        isArchived: true,
        mergedIntoCustomerId: targetCustomerId,
      },
    });

    return {
      mergeLogId: mergeLog.id,
      movedInquiryCount: source.inquiries.length,
    };
  });
}

export class CustomerMergeError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
