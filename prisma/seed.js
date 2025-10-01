import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;

import { hashPassword } from "../src/utils/hash.js";

import { env } from "../config/env.js";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  if (existingAdmin) {
    console.log("Admin user already exists:", existingAdmin.email);
    return;
  }

  const hashedPassword = await hashPassword(env.ADMIN_PASSWORD);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@fundamenta.com",
      password: hashedPassword,
      role: "admin",
      adminProfile: {
        create: {
          fullName: "Super Admin",
        },
      },
    },
    include: {
      adminProfile: true,
    },
  });

  console.log("Admin user created:", adminUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
