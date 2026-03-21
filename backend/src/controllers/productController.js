const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllActiveProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        versions: {
          where: { status: 'ACTIVE' }
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllActiveProducts };