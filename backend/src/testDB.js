const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const products = await prisma.product.findMany({
      include: { versions: true }
    });
    console.log("DB Connection Successful!");
    console.log("Products found:", JSON.stringify(products, null, 2));
  } catch (e) {
    console.error("DB Connection Failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();