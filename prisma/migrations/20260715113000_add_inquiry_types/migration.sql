ALTER TABLE "Inquiry"
ADD COLUMN "inquiryType" TEXT NOT NULL DEFAULT '일반 제품 문의',
ADD COLUMN "department" TEXT,
ADD COLUMN "inquiryDetails" JSONB;
