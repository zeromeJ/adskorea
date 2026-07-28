ALTER TABLE "Customer"
ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "mergedIntoCustomerId" TEXT;

CREATE TABLE "CustomerMergeLog" (
  "id" TEXT NOT NULL,
  "sourceCustomerId" TEXT NOT NULL,
  "targetCustomerId" TEXT NOT NULL,
  "mergedByAdminId" TEXT,
  "mergedByUsername" TEXT NOT NULL,
  "mergedByDisplayName" TEXT,
  "transferredReviews" JSONB,
  "addedFavoriteAdminIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "undoneAt" TIMESTAMP(3),
  "undoneByAdminId" TEXT,
  "undoneByDisplayName" TEXT,
  CONSTRAINT "CustomerMergeLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerMergeInquiry" (
  "mergeLogId" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  CONSTRAINT "CustomerMergeInquiry_pkey" PRIMARY KEY ("mergeLogId", "inquiryId")
);

WITH ranked_inquiries AS (
  SELECT
    inquiry.*,
    ROW_NUMBER() OVER (
      PARTITION BY inquiry."customerId"
      ORDER BY inquiry."createdAt" ASC, inquiry."id" ASC
    ) AS inquiry_order
  FROM "Inquiry" AS inquiry
),
legacy_branches AS (
  SELECT *
  FROM ranked_inquiries
  WHERE inquiry_order > 1
)
INSERT INTO "Customer" (
  "id",
  "name",
  "phone",
  "normalizedPhone",
  "email",
  "normalizedEmail",
  "companyId",
  "isArchived",
  "mergedIntoCustomerId",
  "createdAt",
  "updatedAt"
)
SELECT
  'archived_' || MD5(branch."id"),
  branch."contactPerson",
  branch."phone",
  NULLIF(REGEXP_REPLACE(COALESCE(branch."phone", ''), '[^0-9]', '', 'g'), ''),
  branch."email",
  NULLIF(LOWER(BTRIM(COALESCE(branch."email", ''))), ''),
  company."id",
  true,
  branch."customerId",
  branch."createdAt",
  CURRENT_TIMESTAMP
FROM legacy_branches AS branch
LEFT JOIN "Company" AS company
  ON company."normalizedName" =
    LOWER(REGEXP_REPLACE(BTRIM(branch."companyName"), '\s+', '', 'g'))
ON CONFLICT ("id") DO NOTHING;

WITH ranked_inquiries AS (
  SELECT
    inquiry.*,
    ROW_NUMBER() OVER (
      PARTITION BY inquiry."customerId"
      ORDER BY inquiry."createdAt" ASC, inquiry."id" ASC
    ) AS inquiry_order
  FROM "Inquiry" AS inquiry
),
legacy_branches AS (
  SELECT *
  FROM ranked_inquiries
  WHERE inquiry_order > 1
)
INSERT INTO "CustomerMergeLog" (
  "id",
  "sourceCustomerId",
  "targetCustomerId",
  "mergedByUsername",
  "mergedByDisplayName",
  "createdAt"
)
SELECT
  'merge_legacy_' || MD5(branch."id"),
  'archived_' || MD5(branch."id"),
  branch."customerId",
  'legacy-import',
  '기존 병합 기록',
  branch."updatedAt"
FROM legacy_branches AS branch
ON CONFLICT ("id") DO NOTHING;

WITH ranked_inquiries AS (
  SELECT
    inquiry.*,
    ROW_NUMBER() OVER (
      PARTITION BY inquiry."customerId"
      ORDER BY inquiry."createdAt" ASC, inquiry."id" ASC
    ) AS inquiry_order
  FROM "Inquiry" AS inquiry
)
INSERT INTO "CustomerMergeInquiry" ("mergeLogId", "inquiryId")
SELECT
  'merge_legacy_' || MD5(inquiry."id"),
  inquiry."id"
FROM ranked_inquiries AS inquiry
WHERE inquiry_order > 1
ON CONFLICT ("mergeLogId", "inquiryId") DO NOTHING;

WITH merge_targets AS (
  SELECT DISTINCT "targetCustomerId"
  FROM "CustomerMergeLog"
  WHERE "undoneAt" IS NULL
),
candidate_matches AS (
  SELECT
    target."id" AS target_customer_id,
    candidate."id" AS candidate_customer_id,
    BOOL_OR(
      NULLIF(REGEXP_REPLACE(COALESCE(target_inquiry."phone", ''), '[^0-9]', '', 'g'), '') IS NOT NULL
      AND NULLIF(REGEXP_REPLACE(COALESCE(candidate_inquiry."phone", ''), '[^0-9]', '', 'g'), '') IS NOT NULL
      AND NULLIF(REGEXP_REPLACE(COALESCE(target_inquiry."phone", ''), '[^0-9]', '', 'g'), '') =
        NULLIF(REGEXP_REPLACE(COALESCE(candidate_inquiry."phone", ''), '[^0-9]', '', 'g'), '')
    ) AS matched_phone,
    BOOL_OR(
      NULLIF(LOWER(BTRIM(COALESCE(target_inquiry."email", ''))), '') IS NOT NULL
      AND NULLIF(LOWER(BTRIM(COALESCE(candidate_inquiry."email", ''))), '') IS NOT NULL
      AND NULLIF(LOWER(BTRIM(COALESCE(target_inquiry."email", ''))), '') =
        NULLIF(LOWER(BTRIM(COALESCE(candidate_inquiry."email", ''))), '')
    ) AS matched_email,
    BOOL_OR(
      NULLIF(LOWER(REGEXP_REPLACE(BTRIM(COALESCE(target_inquiry."companyName", '')), '\s+', '', 'g')), '') IS NOT NULL
      AND NULLIF(LOWER(REGEXP_REPLACE(BTRIM(COALESCE(candidate_inquiry."companyName", '')), '\s+', '', 'g')), '') IS NOT NULL
      AND NULLIF(LOWER(REGEXP_REPLACE(BTRIM(COALESCE(target_inquiry."companyName", '')), '\s+', '', 'g')), '') =
        NULLIF(LOWER(REGEXP_REPLACE(BTRIM(COALESCE(candidate_inquiry."companyName", '')), '\s+', '', 'g')), '')
    ) AS matched_company
  FROM merge_targets
  JOIN "Customer" AS target
    ON target."id" = merge_targets."targetCustomerId"
  JOIN "Inquiry" AS target_inquiry
    ON target_inquiry."customerId" = target."id"
  JOIN "Customer" AS candidate
    ON candidate."id" <> target."id"
    AND candidate."isArchived" = false
  JOIN "Inquiry" AS candidate_inquiry
    ON candidate_inquiry."customerId" = candidate."id"
  GROUP BY target."id", candidate."id"
)
INSERT INTO "CustomerDuplicateReview" (
  "id",
  "newCustomerId",
  "candidateCustomerId",
  "matchedPhone",
  "matchedEmail",
  "matchedCompany",
  "createdAt",
  "updatedAt"
)
SELECT
  'review_rebuilt_' || MD5(match.target_customer_id || ':' || match.candidate_customer_id),
  match.target_customer_id,
  match.candidate_customer_id,
  match.matched_phone,
  match.matched_email,
  match.matched_company,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM candidate_matches AS match
WHERE match.matched_phone OR match.matched_email OR match.matched_company
ON CONFLICT ("newCustomerId", "candidateCustomerId")
DO UPDATE SET
  "matchedPhone" =
    "CustomerDuplicateReview"."matchedPhone" OR EXCLUDED."matchedPhone",
  "matchedEmail" =
    "CustomerDuplicateReview"."matchedEmail" OR EXCLUDED."matchedEmail",
  "matchedCompany" =
    "CustomerDuplicateReview"."matchedCompany" OR EXCLUDED."matchedCompany",
  "updatedAt" = CURRENT_TIMESTAMP;

CREATE INDEX "Customer_isArchived_createdAt_idx"
ON "Customer"("isArchived", "createdAt");

CREATE INDEX "Customer_mergedIntoCustomerId_idx"
ON "Customer"("mergedIntoCustomerId");

CREATE INDEX "CustomerMergeLog_targetCustomerId_createdAt_idx"
ON "CustomerMergeLog"("targetCustomerId", "createdAt");

CREATE INDEX "CustomerMergeLog_sourceCustomerId_idx"
ON "CustomerMergeLog"("sourceCustomerId");

CREATE INDEX "CustomerMergeLog_undoneAt_idx"
ON "CustomerMergeLog"("undoneAt");

CREATE INDEX "CustomerMergeInquiry_inquiryId_idx"
ON "CustomerMergeInquiry"("inquiryId");

ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_mergedIntoCustomerId_fkey"
FOREIGN KEY ("mergedIntoCustomerId") REFERENCES "Customer"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CustomerMergeLog"
ADD CONSTRAINT "CustomerMergeLog_sourceCustomerId_fkey"
FOREIGN KEY ("sourceCustomerId") REFERENCES "Customer"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CustomerMergeLog"
ADD CONSTRAINT "CustomerMergeLog_targetCustomerId_fkey"
FOREIGN KEY ("targetCustomerId") REFERENCES "Customer"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CustomerMergeInquiry"
ADD CONSTRAINT "CustomerMergeInquiry_mergeLogId_fkey"
FOREIGN KEY ("mergeLogId") REFERENCES "CustomerMergeLog"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomerMergeInquiry"
ADD CONSTRAINT "CustomerMergeInquiry_inquiryId_fkey"
FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."CustomerMergeLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomerMergeInquiry" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public."CustomerMergeLog",
  public."CustomerMergeInquiry"
FROM PUBLIC, anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE
  public."CustomerMergeLog",
  public."CustomerMergeInquiry"
FROM service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public."CustomerMergeLog",
  public."CustomerMergeInquiry"
TO service_role;
