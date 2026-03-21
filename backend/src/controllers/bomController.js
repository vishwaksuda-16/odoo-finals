const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createAuditEntry } = require('../utils/logger'); // We created this earlier

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
    await createAuditEntry(userId, "BOM_VERSION_BUMP", eco.productId, currentBoM, newBoM);

    return newBoM;
  });
};

module.exports = { approveBoMECO };