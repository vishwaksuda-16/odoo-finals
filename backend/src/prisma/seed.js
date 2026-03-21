const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Admin Access...');

  // 1. Optional: Clean only the User table (keeping your manual products if any)
  // await prisma.user.deleteMany({});

  // 2. Hash the password for the Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 3. Create the single Admin record
  const admin = await prisma.user.upsert({
    where: { email: 'admin@plm.com' },
    update: {},
    create: {
      email: 'admin@plm.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN', // This gives you full access to all tabs
    },
  });

  console.log('Admin Seed Successful!');
  console.log(' Email: admin@plm.com');
  console.log(' Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });