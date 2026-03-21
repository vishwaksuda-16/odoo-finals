const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET the active BOM for a product
const getProductBoM = async (req, res) => {
  const { id } = req.params; // Product ID
  try {
    const bom = await prisma.billOfMaterial.findFirst({
      where: { productId: id, status: 'ACTIVE' },
      include: { components: true }
    });
    
    if (!bom) return res.status(404).json({ message: "No active BOM found for this product" });
    res.json(bom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE a new BOM for a product
const createBoM = async (req, res) => {
  const { productId, components } = req.body; // components: [{name, qty}, ...]
  try {
    const newBoM = await prisma.billOfMaterial.create({
      data: {
        productId,
        status: 'ACTIVE',
        components: {
          create: components.map(c => ({
            componentName: c.componentName,
            quantity: c.quantity
          }))
        }
      },
      include: { components: true }
    });
    res.status(201).json(newBoM);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveBoMECO = async (ecoId, userId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch ECO with details
    const eco = await tx.eCO.findUnique({
      where: { id: ecoId },
      include: { product: true }
    });

    if (!eco || eco.status !== 'NEW') throw new Error("Invalid ECO status");

    // 2. Find Current Active BoM for this product
    const currentBoM = await tx.billOfMaterial.findFirst({
      where: { productId: eco.productId, status: 'ACTIVE' },
      include: { components: true }
    });

    // 3. ARCHIVE the current BoM
    if (currentBoM) {
      await tx.billOfMaterial.update({
        where: { id: currentBoM.id },
        data: { status: 'ARCHIVED' }
      });
    }

    // 4. CREATE New BoM Version
    // proposedChanges should be: { components: [{ name: 'Screws', qty: 16 }, ...] }
    const newComponents = eco.proposedChanges.components;

    const newBoM = await tx.billOfMaterial.create({
      data: {
        productId: eco.productId,
        versionNumber: (currentBoM?.versionNumber || 0) + 1,
        status: 'ACTIVE',
        components: {
          create: newComponents.map(c => ({
            componentName: c.name,
            quantity: c.qty
          }))
        }
      },
      include: { components: true }
    });

    // 5. Finalize ECO
    await tx.eCO.update({
      where: { id: ecoId },
      data: { status: 'APPROVED' }
    });

    // 6. Log it
    await tx.auditLog.create({
        data: {
            action: "BOM_VERSION_BUMP",
            targetId: eco.productId,
            oldValue: currentBoM ? JSON.stringify(currentBoM) : null,
            newValue: JSON.stringify(newBoM),
            userId: userId
        }
    });

    return newBoM;
  });
};

module.exports = { approveBoMECO, getProductBoM, createBoM };;