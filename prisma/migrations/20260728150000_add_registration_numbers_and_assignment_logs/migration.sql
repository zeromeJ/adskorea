CREATE SEQUENCE "Inquiry_registrationNumber_seq";

ALTER TABLE "Inquiry"
ADD COLUMN "registrationNumber" TEXT;

WITH numbered AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS sequence_number,
    TO_CHAR(
      "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul',
      'YYMMDD'
    ) AS date_part
  FROM "Inquiry"
)
UPDATE "Inquiry" AS inquiry
SET "registrationNumber" =
  numbered.date_part || LPAD(numbered.sequence_number::TEXT, 4, '0')
FROM numbered
WHERE inquiry."id" = numbered."id";

SELECT SETVAL(
  '"Inquiry_registrationNumber_seq"',
  GREATEST((SELECT COUNT(*) FROM "Inquiry"), 1),
  EXISTS(SELECT 1 FROM "Inquiry")
);

ALTER TABLE "Inquiry"
ALTER COLUMN "registrationNumber" SET NOT NULL;

CREATE UNIQUE INDEX "Inquiry_registrationNumber_key"
ON "Inquiry"("registrationNumber");

CREATE TABLE "InquiryAssignmentLog" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "adminUserId" TEXT,
  "adminUsername" TEXT NOT NULL,
  "adminDisplayName" TEXT,
  "assignedAdminId" TEXT,
  "assignedAdminDisplayName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InquiryAssignmentLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InquiryAssignmentLog_createdAt_idx"
ON "InquiryAssignmentLog"("createdAt");

CREATE INDEX "InquiryAssignmentLog_inquiryId_idx"
ON "InquiryAssignmentLog"("inquiryId");

CREATE INDEX "InquiryAssignmentLog_adminUserId_idx"
ON "InquiryAssignmentLog"("adminUserId");

ALTER TABLE "InquiryAssignmentLog"
ADD CONSTRAINT "InquiryAssignmentLog_inquiryId_fkey"
FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InquiryAssignmentLog"
ADD CONSTRAINT "InquiryAssignmentLog_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public."InquiryAssignmentLog" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public."InquiryAssignmentLog"
FROM PUBLIC, anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE public."InquiryAssignmentLog"
FROM service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."InquiryAssignmentLog"
TO service_role;
