const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const approveECO = async (ecoId, userId) => {
  return await prisma.$transaction(async (tx) => {
    const eco = await tx.eCO.findUnique({ where: { id: ecoId } });
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
        salePrice: changes.salePrice || currentActive.salePrice,
        costPrice: changes.costPrice || currentActive.costPrice,
        status: 'ACTIVE'
      }
    });

    await tx.eCO.update({ where: { id: ecoId }, data: { status: 'APPROVED' } });

    return newVersion;
  });
};

module.exports = { approveECO };