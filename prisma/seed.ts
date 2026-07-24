import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@middlemarket.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Marketplace Admin",
      role: "ADMIN",
      password: await bcrypt.hash(password, 10),
    },
  });
  console.log(`Admin user ready: ${email}`);
}

main().finally(() => prisma.$disconnect());
