CREATE TYPE "WebsiteAssetType" AS ENUM ('IMAGE', 'PDF', 'VIDEO');

CREATE TABLE "WebsiteSection" (
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "requiredCount" INTEGER NOT NULL DEFAULT 0,
  "data" JSONB,
  "updatedById" TEXT,
  "updatedByName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsiteSection_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "WebsiteAsset" (
  "id" TEXT NOT NULL,
  "sectionKey" TEXT NOT NULL,
  "itemKey" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "type" "WebsiteAssetType" NOT NULL,
  "url" TEXT,
  "originalUrl" TEXT,
  "storagePath" TEXT,
  "originalStoragePath" TEXT,
  "originalFileName" TEXT,
  "storedFileName" TEXT,
  "mimeType" TEXT,
  "size" INTEGER,
  "width" INTEGER,
  "height" INTEGER,
  "cropX" DOUBLE PRECISION,
  "cropY" DOUBLE PRECISION,
  "cropWidth" DOUBLE PRECISION,
  "cropHeight" DOUBLE PRECISION,
  "zoom" DOUBLE PRECISION,
  "rotation" INTEGER,
  "aspectRatio" TEXT,
  "outputWidth" INTEGER,
  "outputHeight" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsiteAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebsiteChangeLog" (
  "id" TEXT NOT NULL,
  "sectionKey" TEXT NOT NULL,
  "sectionTitle" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "adminUsername" TEXT NOT NULL,
  "adminDisplayName" TEXT,
  "previousData" JSONB,
  "newData" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebsiteChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WebsiteAsset_sectionKey_itemKey_sortOrder_idx" ON "WebsiteAsset"("sectionKey", "itemKey", "sortOrder");
CREATE INDEX "WebsiteChangeLog_createdAt_idx" ON "WebsiteChangeLog"("createdAt");
CREATE INDEX "WebsiteChangeLog_sectionKey_idx" ON "WebsiteChangeLog"("sectionKey");
ALTER TABLE "WebsiteAsset" ADD CONSTRAINT "WebsiteAsset_sectionKey_fkey" FOREIGN KEY ("sectionKey") REFERENCES "WebsiteSection"("key") ON DELETE CASCADE ON UPDATE CASCADE;
