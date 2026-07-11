CREATE TYPE "ResponseMethod" AS ENUM ('PHONE', 'TEXT', 'BOTH');

ALTER TABLE "Inquiry"
ADD COLUMN "responseMethod" "ResponseMethod" NOT NULL DEFAULT 'BOTH';
