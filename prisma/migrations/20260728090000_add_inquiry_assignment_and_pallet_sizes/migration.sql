ALTER TABLE "Inquiry"
ADD COLUMN "requestedPalletSizes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "assignedAdminId" TEXT,
ADD COLUMN "assignedAt" TIMESTAMP(3);

UPDATE "Inquiry"
SET "requestedPalletSizes" = ARRAY["requiredPalletSize"]
WHERE "requiredPalletSize" IS NOT NULL
  AND BTRIM("requiredPalletSize") <> '';

CREATE INDEX "Inquiry_assignedAdminId_status_createdAt_idx"
ON "Inquiry"("assignedAdminId", "status", "createdAt");

ALTER TABLE "Inquiry"
ADD CONSTRAINT "Inquiry_assignedAdminId_fkey"
FOREIGN KEY ("assignedAdminId") REFERENCES "AdminUser"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
