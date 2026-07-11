ALTER TABLE "AdminUser"
ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

UPDATE "AdminUser"
SET "isSuperAdmin" = true
WHERE "id" = (
  SELECT "id"
  FROM "AdminUser"
  ORDER BY "createdAt" ASC
  LIMIT 1
);

CREATE TABLE "InquiryCompletionLog" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "adminUserId" TEXT,
  "adminUsername" TEXT NOT NULL,
  "adminDisplayName" TEXT,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InquiryCompletionLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InquiryCompletionLog_completedAt_idx"
ON "InquiryCompletionLog"("completedAt");

CREATE INDEX "InquiryCompletionLog_inquiryId_idx"
ON "InquiryCompletionLog"("inquiryId");

CREATE INDEX "InquiryCompletionLog_adminUserId_idx"
ON "InquiryCompletionLog"("adminUserId");

ALTER TABLE "InquiryCompletionLog"
ADD CONSTRAINT "InquiryCompletionLog_inquiryId_fkey"
FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InquiryCompletionLog"
ADD CONSTRAINT "InquiryCompletionLog_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
