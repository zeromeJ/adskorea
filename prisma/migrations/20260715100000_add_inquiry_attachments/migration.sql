CREATE TABLE "InquiryAttachment" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "storagePath" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InquiryAttachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InquiryAttachment_storagePath_key" ON "InquiryAttachment"("storagePath");
CREATE INDEX "InquiryAttachment_inquiryId_idx" ON "InquiryAttachment"("inquiryId");

ALTER TABLE "InquiryAttachment"
ADD CONSTRAINT "InquiryAttachment_inquiryId_fkey"
FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
