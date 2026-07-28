CREATE TYPE "CustomerDuplicateReviewStatus" AS ENUM (
  'PENDING',
  'LINKED',
  'KEPT_SEPARATE',
  'MERGED'
);

CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "normalizedName" TEXT NOT NULL,
  "memo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "normalizedPhone" TEXT,
  "email" TEXT,
  "normalizedEmail" TEXT,
  "memo" TEXT,
  "companyId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerFavorite" (
  "adminUserId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerFavorite_pkey" PRIMARY KEY ("adminUserId", "customerId")
);

CREATE TABLE "CustomerDuplicateReview" (
  "id" TEXT NOT NULL,
  "newCustomerId" TEXT NOT NULL,
  "candidateCustomerId" TEXT NOT NULL,
  "matchedPhone" BOOLEAN NOT NULL DEFAULT false,
  "matchedEmail" BOOLEAN NOT NULL DEFAULT false,
  "matchedCompany" BOOLEAN NOT NULL DEFAULT false,
  "status" "CustomerDuplicateReviewStatus" NOT NULL DEFAULT 'PENDING',
  "resolvedByAdminId" TEXT,
  "resolvedByDisplayName" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerDuplicateReview_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Inquiry"
ADD COLUMN "customerId" TEXT;

INSERT INTO "Company" (
  "id",
  "name",
  "normalizedName",
  "createdAt",
  "updatedAt"
)
SELECT
  'company_' || MD5(normalized_name),
  MIN("companyName"),
  normalized_name,
  MIN("createdAt"),
  CURRENT_TIMESTAMP
FROM (
  SELECT
    "companyName",
    "createdAt",
    LOWER(REGEXP_REPLACE(BTRIM("companyName"), '\s+', '', 'g')) AS normalized_name
  FROM "Inquiry"
  WHERE BTRIM("companyName") <> ''
) AS company_names
GROUP BY normalized_name;

INSERT INTO "Customer" (
  "id",
  "name",
  "phone",
  "normalizedPhone",
  "email",
  "normalizedEmail",
  "companyId",
  "createdAt",
  "updatedAt"
)
SELECT
  'customer_' || MD5(inquiry."id"),
  inquiry."contactPerson",
  inquiry."phone",
  NULLIF(REGEXP_REPLACE(COALESCE(inquiry."phone", ''), '[^0-9]', '', 'g'), ''),
  inquiry."email",
  NULLIF(LOWER(BTRIM(COALESCE(inquiry."email", ''))), ''),
  company."id",
  inquiry."createdAt",
  inquiry."updatedAt"
FROM "Inquiry" AS inquiry
LEFT JOIN "Company" AS company
  ON company."normalizedName" =
    LOWER(REGEXP_REPLACE(BTRIM(inquiry."companyName"), '\s+', '', 'g'));

UPDATE "Inquiry" AS inquiry
SET "customerId" = 'customer_' || MD5(inquiry."id");

ALTER TABLE "Inquiry"
ALTER COLUMN "customerId" SET NOT NULL;

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
  'review_' || MD5(new_customer."id" || ':' || candidate."id"),
  new_customer."id",
  candidate."id",
  (
    new_customer."normalizedPhone" IS NOT NULL
    AND candidate."normalizedPhone" IS NOT NULL
    AND new_customer."normalizedPhone" = candidate."normalizedPhone"
  ),
  (
    new_customer."normalizedEmail" IS NOT NULL
    AND candidate."normalizedEmail" IS NOT NULL
    AND new_customer."normalizedEmail" = candidate."normalizedEmail"
  ),
  (
    new_customer."companyId" IS NOT NULL
    AND candidate."companyId" IS NOT NULL
    AND new_customer."companyId" = candidate."companyId"
  ),
  new_customer."createdAt",
  CURRENT_TIMESTAMP
FROM "Customer" AS new_customer
JOIN "Customer" AS candidate
  ON (
    candidate."createdAt" < new_customer."createdAt"
    OR (
      candidate."createdAt" = new_customer."createdAt"
      AND candidate."id" < new_customer."id"
    )
  )
  AND (
    (
      new_customer."normalizedPhone" IS NOT NULL
      AND new_customer."normalizedPhone" = candidate."normalizedPhone"
    )
    OR (
      new_customer."normalizedEmail" IS NOT NULL
      AND new_customer."normalizedEmail" = candidate."normalizedEmail"
    )
    OR (
      new_customer."companyId" IS NOT NULL
      AND new_customer."companyId" = candidate."companyId"
    )
  );

CREATE UNIQUE INDEX "Company_normalizedName_key"
ON "Company"("normalizedName");

CREATE INDEX "Customer_normalizedPhone_idx"
ON "Customer"("normalizedPhone");

CREATE INDEX "Customer_normalizedEmail_idx"
ON "Customer"("normalizedEmail");

CREATE INDEX "Customer_companyId_idx"
ON "Customer"("companyId");

CREATE INDEX "Customer_createdAt_idx"
ON "Customer"("createdAt");

CREATE INDEX "CustomerFavorite_customerId_idx"
ON "CustomerFavorite"("customerId");

CREATE UNIQUE INDEX "CustomerDuplicateReview_newCustomerId_candidateCustomerId_key"
ON "CustomerDuplicateReview"("newCustomerId", "candidateCustomerId");

CREATE INDEX "CustomerDuplicateReview_status_createdAt_idx"
ON "CustomerDuplicateReview"("status", "createdAt");

CREATE INDEX "CustomerDuplicateReview_candidateCustomerId_idx"
ON "CustomerDuplicateReview"("candidateCustomerId");

CREATE INDEX "Inquiry_customerId_status_createdAt_idx"
ON "Inquiry"("customerId", "status", "createdAt");

ALTER TABLE "Inquiry"
ADD CONSTRAINT "Inquiry_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CustomerFavorite"
ADD CONSTRAINT "CustomerFavorite_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomerFavorite"
ADD CONSTRAINT "CustomerFavorite_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomerDuplicateReview"
ADD CONSTRAINT "CustomerDuplicateReview_newCustomerId_fkey"
FOREIGN KEY ("newCustomerId") REFERENCES "Customer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomerDuplicateReview"
ADD CONSTRAINT "CustomerDuplicateReview_candidateCustomerId_fkey"
FOREIGN KEY ("candidateCustomerId") REFERENCES "Customer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomerFavorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomerDuplicateReview" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public."Company",
  public."Customer",
  public."CustomerFavorite",
  public."CustomerDuplicateReview"
FROM PUBLIC, anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE
  public."Company",
  public."Customer",
  public."CustomerFavorite",
  public."CustomerDuplicateReview"
FROM service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public."Company",
  public."Customer",
  public."CustomerFavorite",
  public."CustomerDuplicateReview"
TO service_role;
