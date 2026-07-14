import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function hasWebsiteContentDelegates(client: PrismaClient | undefined) {
  if (!client) return false;
  const runtimeClient = client as unknown as Record<string, unknown>;
  return Boolean(
    runtimeClient.websiteSection &&
      runtimeClient.websiteAsset &&
      runtimeClient.websiteChangeLog,
  );
}

const cachedPrisma = globalForPrisma.prisma;

export const prisma =
  (cachedPrisma && hasWebsiteContentDelegates(cachedPrisma)
    ? cachedPrisma
    : undefined) ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function hasWebsiteContentModels() {
  return hasWebsiteContentDelegates(prisma);
}
