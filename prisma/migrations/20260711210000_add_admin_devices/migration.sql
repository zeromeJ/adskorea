CREATE TABLE "AdminDevice" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminDevice_token_key" ON "AdminDevice"("token");
CREATE INDEX "AdminDevice_adminUserId_idx" ON "AdminDevice"("adminUserId");

ALTER TABLE "AdminDevice"
ADD CONSTRAINT "AdminDevice_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
