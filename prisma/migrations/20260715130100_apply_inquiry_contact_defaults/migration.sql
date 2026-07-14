ALTER TABLE "Inquiry" ALTER COLUMN "responseMethod" SET DEFAULT 'ANY';
ALTER TABLE "Inquiry" ALTER COLUMN "message" TYPE VARCHAR(1500);

UPDATE "Inquiry" SET "responseMethod" = 'ANY' WHERE "responseMethod" = 'BOTH';
