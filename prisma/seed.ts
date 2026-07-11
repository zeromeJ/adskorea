import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_INITIAL_USERNAME || "admin";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "1234";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { username },
    create: {
      username,
      passwordHash,
      displayName: "관리자",
      isActive: true,
      isSuperAdmin: true,
    },
    update: {
      passwordHash,
      isActive: true,
      isSuperAdmin: true,
    },
  });

  console.log(`Initial admin account is ready: ${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
