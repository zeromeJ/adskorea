CREATE TYPE "InquiryConsultationResult" AS ENUM (
  'PHONE_COMPLETED',
  'MATERIAL_SENT',
  'QUOTE_REVIEW',
  'WAITING_RESPONSE',
  'UNREACHABLE',
  'OTHER'
);

CREATE TYPE "CustomerReviewRequestType" AS ENUM (
  'DUPLICATE_REVIEW',
  'COMPANY_REVIEW'
);

CREATE TYPE "CustomerReviewRequestStatus" AS ENUM (
  'PENDING',
  'RESOLVED'
);

ALTER TABLE "Inquiry"
ADD COLUMN "lastActionAt" TIMESTAMP(3);

UPDATE "Inquiry"
SET "lastActionAt" = GREATEST("createdAt", "updatedAt");

ALTER TABLE "Inquiry"
ALTER COLUMN "lastActionAt" SET NOT NULL,
ALTER COLUMN "lastActionAt" SET DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Inquiry_status_lastActionAt_idx"
ON "Inquiry"("status", "lastActionAt");

CREATE TABLE "InquiryConsultationRecord" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "result" "InquiryConsultationResult" NOT NULL,
  "memo" TEXT,
  "adminUserId" TEXT,
  "adminUsername" TEXT NOT NULL,
  "adminDisplayName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InquiryConsultationRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InquiryConsultationRecord_inquiryId_createdAt_idx"
ON "InquiryConsultationRecord"("inquiryId", "createdAt");

CREATE INDEX "InquiryConsultationRecord_adminUserId_idx"
ON "InquiryConsultationRecord"("adminUserId");

ALTER TABLE "InquiryConsultationRecord"
ADD CONSTRAINT "InquiryConsultationRecord_inquiryId_fkey"
FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InquiryConsultationRecord"
ADD CONSTRAINT "InquiryConsultationRecord_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CustomerPrivateMemo" (
  "customerId" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "memo" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerPrivateMemo_pkey" PRIMARY KEY ("customerId", "adminUserId")
);

CREATE INDEX "CustomerPrivateMemo_adminUserId_idx"
ON "CustomerPrivateMemo"("adminUserId");

ALTER TABLE "CustomerPrivateMemo"
ADD CONSTRAINT "CustomerPrivateMemo_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomerPrivateMemo"
ADD CONSTRAINT "CustomerPrivateMemo_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CompanyPrivateMemo" (
  "companyId" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "memo" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyPrivateMemo_pkey" PRIMARY KEY ("companyId", "adminUserId")
);

CREATE INDEX "CompanyPrivateMemo_adminUserId_idx"
ON "CompanyPrivateMemo"("adminUserId");

ALTER TABLE "CompanyPrivateMemo"
ADD CONSTRAINT "CompanyPrivateMemo_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyPrivateMemo"
ADD CONSTRAINT "CompanyPrivateMemo_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CompanyChangeLog" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "adminUserId" TEXT,
  "adminUsername" TEXT NOT NULL,
  "adminDisplayName" TEXT,
  "previousCompanyId" TEXT,
  "previousCompanyName" TEXT,
  "newCompanyId" TEXT,
  "newCompanyName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CompanyChangeLog_customerId_createdAt_idx"
ON "CompanyChangeLog"("customerId", "createdAt");

CREATE INDEX "CompanyChangeLog_adminUserId_idx"
ON "CompanyChangeLog"("adminUserId");

ALTER TABLE "CompanyChangeLog"
ADD CONSTRAINT "CompanyChangeLog_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyChangeLog"
ADD CONSTRAINT "CompanyChangeLog_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CustomerReviewRequest" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "requestedById" TEXT,
  "requestedByName" TEXT,
  "type" "CustomerReviewRequestType" NOT NULL,
  "status" "CustomerReviewRequestStatus" NOT NULL DEFAULT 'PENDING',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "CustomerReviewRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerReviewRequest_customerId_status_idx"
ON "CustomerReviewRequest"("customerId", "status");

CREATE INDEX "CustomerReviewRequest_status_createdAt_idx"
ON "CustomerReviewRequest"("status", "createdAt");

ALTER TABLE "CustomerReviewRequest"
ADD CONSTRAINT "CustomerReviewRequest_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomerReviewRequest"
ADD CONSTRAINT "CustomerReviewRequest_requestedById_fkey"
FOREIGN KEY ("requestedById") REFERENCES "AdminUser"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public."InquiryConsultationRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomerPrivateMemo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CompanyPrivateMemo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CompanyChangeLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomerReviewRequest" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public."InquiryConsultationRecord",
  public."CustomerPrivateMemo",
  public."CompanyPrivateMemo",
  public."CompanyChangeLog",
  public."CustomerReviewRequest"
FROM PUBLIC, anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE
  public."InquiryConsultationRecord",
  public."CustomerPrivateMemo",
  public."CompanyPrivateMemo",
  public."CompanyChangeLog",
  public."CustomerReviewRequest"
FROM service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public."InquiryConsultationRecord",
  public."CustomerPrivateMemo",
  public."CompanyPrivateMemo",
  public."CompanyChangeLog",
  public."CustomerReviewRequest"
TO service_role;
