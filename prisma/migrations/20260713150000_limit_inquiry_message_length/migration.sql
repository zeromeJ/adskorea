-- Preserve existing inquiries while enforcing the same 300-character limit
-- used by the website and API.
UPDATE "Inquiry"
SET "message" = LEFT("message", 300)
WHERE LENGTH("message") > 300;

ALTER TABLE "Inquiry"
ALTER COLUMN "message" TYPE VARCHAR(300);
