const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Clean existing data (Optional but helpful for retrying)
  await prisma.auditLog.deleteMany({});
  await prisma.eCO.deleteMany({});
  await prisma.productVersion.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const engineer = await prisma.user.create({
    data: { email: 'eng@plm.com', password: hashedPassword, role: 'ENGINEER' }
  });
  const approver = await prisma.user.create({
    data: { email: 'boss@plm.com', password: hashedPassword, role: 'APPROVER' }
  });

  // 3. Create initial Product
  const product = await prisma.product.create({
    data: {
      sku: 'WD-TABLE-001',
      name: 'Wooden Office Table',
      versions: {
        create: {
          versionNumber: 1,
          salePrice: 150.00,
          costPrice: 80.00,
          status: 'ACTIVE'
        }
      }
    }
  });

  console.log('Seed successful!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });