const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com';
  const password = process.env.SEED_ADMIN_PASSWORD || '123456';

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists:', email);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({ data: { email, password: hashed } });
  console.log('Created admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
