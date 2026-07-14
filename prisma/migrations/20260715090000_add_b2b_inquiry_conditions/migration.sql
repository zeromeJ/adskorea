ALTER TABLE "Inquiry"
ADD COLUMN "cargoType" TEXT,
ADD COLUMN "loadPerPallet" TEXT,
ADD COLUMN "requiredPalletSize" TEXT,
ADD COLUMN "rackStorage" BOOLEAN,
ADD COLUMN "automationUse" BOOLEAN,
ADD COLUMN "forkliftUse" BOOLEAN,
ADD COLUMN "handPalletTruckUse" BOOLEAN;
