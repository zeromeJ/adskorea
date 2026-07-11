import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_INITIAL_USERNAME || "admin";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "1234";

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (existingAdmin) {
    return;
  }

  // TODO: Change default admin password before production.
  // TODO: Add admin account management UI later if needed.
  // TODO: Move initial admin credentials to environment variables for production.
  // TODO: Add admin user management API later.
  // TODO: Add password change screen later.
  // TODO: Allow multiple admin accounts later.
  // TODO: Replace default admin password before production.
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: {
      username,
      passwordHash,
      displayName: "관리자",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
