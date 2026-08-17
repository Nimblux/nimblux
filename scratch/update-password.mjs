import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function updateAdminPassword() {
  const newPassword = "8937Dev@Nimblux";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatedAdmin = await prisma.user.update({
    where: { email: "admin@nimblux.com" },
    data: { passwordHash: hashedPassword },
  });

  console.log(`Successfully updated admin password for ${updatedAdmin.email} (${updatedAdmin.role})`);
}

updateAdminPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
