const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. ADD THE MISSING CREATE FUNCTION
const createECO = async (req, res) => {
  const { title, type, productId, proposedChanges } = req.body;
  try {
    const newEco = await prisma.eCO.create({
      data: {
        title,
        type,
        productId,
        proposedChanges, // Ensure this is a JSON object
        status: 'PENDING',
        createdById: req.user.userId // Added from JWT middleware
      }
    });
    res.status(201).json(newEco);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. CONVERT approveECO to an Express Handler
const approveECO = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const eco = await tx.eCO.findUnique({ where: { id } });
      if (!eco) throw new Error("ECO not found");

      const currentActive = await tx.productVersion.findFirst({
        where: { productId: eco.productId, status: 'ACTIVE' }
      });

      if (currentActive) {
        await tx.productVersion.update({
          where: { id: currentActive.id },
          data: { status: 'ARCHIVED' }
        });
      }

      const changes = eco.proposedChanges;
      const newVersion = await tx.productVersion.create({
        data: {
          versionNumber: (currentActive?.versionNumber || 0) + 1,
          productId: eco.productId,
          salePrice: changes.salePrice || currentActive?.salePrice,
          costPrice: changes.costPrice || currentActive?.costPrice,
          status: 'ACTIVE'
        }
      });

      await tx.eCO.update({ where: { id }, data: { status: 'APPROVED' } });

      // Traceability: Add Audit Log
      await tx.auditLog.create({
        data: {
          action: "PRODUCT_VERSION_BUMP",
          targetId: eco.productId,
          oldValue: JSON.stringify(currentActive),
          newValue: JSON.stringify(newVersion),
          userId: userId
        }
      });

      return newVersion;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. EXPORT BOTH
module.exports = { createECO, approveECO };