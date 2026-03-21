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

// ADD THIS FUNCTION
const getProductHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const history = await prisma.product.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        ecos: { 
          include: { createdBy: { select: { email: true } } },
          orderBy: { createdAt: 'desc' } 
        }
      }
    });
    if (!history) return res.status(404).json({ error: "Product not found" });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  const { sku, name, initialSalePrice, initialCostPrice } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the base Product
      const product = await tx.product.create({
        data: { sku, name }
      });

      // 2. Create Version 1 automatically
      const version = await tx.productVersion.create({
        data: {
          versionNumber: 1,
          productId: product.id,
          salePrice: initialSalePrice,
          costPrice: initialCostPrice,
          status: 'ACTIVE'
        }
      });

      return { product, version };
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllActiveProducts, getProductHistory, createProduct };