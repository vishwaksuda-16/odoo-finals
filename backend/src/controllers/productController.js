const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllActiveProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { archived: false },
      include: {
        versions: {
          where: { status: 'ACTIVE' },
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getArchivedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { archived: true },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' }
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        versions: {
          where: { status: 'ACTIVE' },
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({ where: { targetId: id } });
      await tx.eCO.deleteMany({ where: { productId: id } });
      const boms = await tx.billOfMaterial.findMany({ where: { productId: id }, select: { id: true } });
      const bomIds = boms.map((b) => b.id);
      if (bomIds.length) {
        await tx.boMComponent.deleteMany({ where: { bomId: { in: bomIds } } });
        await tx.billOfMaterial.deleteMany({ where: { id: { in: bomIds } } });
      }
      await tx.productVersion.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAllProducts = async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({});
      await tx.eCO.deleteMany({});
      await tx.boMComponent.deleteMany({});
      await tx.billOfMaterial.deleteMany({});
      await tx.productVersion.deleteMany({});
      await tx.product.deleteMany({});
    });
    res.json({ message: "All product records deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const archiveProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.update({
      where: { id },
      data: { archived: true }
    });
    res.json({ message: "Product archived" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unarchiveProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.update({
      where: { id },
      data: { archived: false }
    });
    res.json({ message: "Product unarchived" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllActiveProducts,
  getArchivedProducts,
  getProductById,
  getProductHistory,
  createProduct,
  deleteProduct,
  deleteAllProducts,
  archiveProduct,
  unarchiveProduct
};