const { PrismaClient } = require('@prisma/client');
const { sendNotification } = require('../utils/mailer');
const prisma = new PrismaClient();

const getECOs = async (req, res) => {
  try {
    const ecos = await prisma.eCO.findMany({
      include: {
        product: {
          include: {
            versions: {
              where: { status: 'ACTIVE' },
              take: 1,
              orderBy: { versionNumber: 'desc' }
            },
            boms: {
              where: { status: 'ACTIVE' },
              take: 1,
              orderBy: { versionNumber: 'desc' },
              include: { components: true }
            }
          }
        },
        createdBy: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(ecos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 1. CREATE ECO in DRAFT
const createECO = async (req, res) => {
  const { title, type, productId, proposedChanges } = req.body;
  try {
    const newEco = await prisma.eCO.create({
      data: {
        title,
        type,
        productId,
        proposedChanges,
        status: 'DRAFT',
        createdById: req.user.userId 
      }
    });

    res.status(201).json(newEco);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. APPROVE ECO + Notify Original Engineer
const approveECO = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Fetch the ECO first to get the creator's info
      const eco = await tx.eCO.findUnique({ 
        where: { id },
        include: { createdBy: true } 
      });
      
      if (!eco) throw new Error("ECO not found");
      if (eco.status !== 'PENDING') throw new Error("ECO must be in approval stage");
      if (eco.createdById === userId && role !== 'ADMIN') {
        throw new Error("Separation of duties: creator cannot approve own ECO");
      }

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

      await tx.auditLog.create({
        data: {
          action: "PRODUCT_VERSION_BUMP",
          targetId: eco.productId,
          oldValue: JSON.stringify(currentActive),
          newValue: JSON.stringify(newVersion),
          userId: userId
        }
      });


      sendNotification(
        eco.createdBy.email,
        "ECO Approved & Live",
        `Your change request "${eco.title}" has been finalized. Product Version ${newVersion.versionNumber} is now active.`,
        `<h2>Change Implemented</h2><p>The ECO for <b>${eco.title}</b> was approved by the lead engineer.</p>`
      );
      // 

      return newVersion;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectECO = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    const eco = await prisma.eCO.findUnique({ where: { id } });
    if (!eco) return res.status(404).json({ message: "ECO not found" });
    if (eco.status !== 'PENDING') {
      return res.status(400).json({ message: "ECO must be in approval stage" });
    }
    if (eco.createdById === userId && role !== 'ADMIN') {
      return res.status(403).json({ message: "Separation of duties: creator cannot reject own ECO" });
    }

    const updated = await prisma.eCO.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    await prisma.auditLog.create({
      data: {
        action: "ECO_REJECTED",
        targetId: updated.id,
        oldValue: JSON.stringify({ status: 'PENDING' }),
        newValue: JSON.stringify({ status: 'REJECTED' }),
        userId
      }
    });

    const creator = await prisma.user.findUnique({ where: { id: eco.createdById } });
    if (creator?.email) {
      sendNotification(
        creator.email,
        `ECO Rejected: ${eco.title}`,
        `Your change request "${eco.title}" was rejected and sent back for rework.`,
        `<h3>ECO Rejected</h3><p>Your request <b>${eco.title}</b> has been rejected. Please revise and resubmit.</p>`
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateECOStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const allowed = ['NEW', 'PENDING'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Unsupported status transition" });
    }
    const current = await prisma.eCO.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: "ECO not found" });

    const invalidTransition =
      (status === 'NEW' && !['DRAFT', 'REJECTED'].includes(current.status)) ||
      (status === 'PENDING' && current.status !== 'NEW');
    if (invalidTransition) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    const eco = await prisma.eCO.update({
      where: { id },
      data: { status }
    });

    if (status === 'PENDING') {
      const approvers = await prisma.user.findMany({ where: { role: 'APPROVER' } });
      approvers.forEach(appr => {
        sendNotification(
          appr.email,
          `Action Required: ECO ${current.title}`,
          `A change request was submitted for product ${current.productId}.`,
          `<h3>New ECO for Review</h3><p><b>Title:</b> ${current.title}</p><p>Please review and approve/reject.</p>`
        );
      });
    }

    res.json(eco);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDraftECO = async (req, res) => {
  const { id } = req.params;
  const { title, productId, type, proposedChanges } = req.body;
  try {
    const eco = await prisma.eCO.findUnique({ where: { id } });
    if (!eco) return res.status(404).json({ message: "ECO not found" });
    if (!['DRAFT', 'REJECTED'].includes(eco.status)) {
      return res.status(400).json({ message: "Only draft/rejected ECO can be edited" });
    }
    if (eco.createdById !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Only creator/admin can edit this draft" });
    }

    const updated = await prisma.eCO.update({
      where: { id },
      data: {
        title: title ?? eco.title,
        productId: productId ?? eco.productId,
        type: type ?? eco.type,
        proposedChanges: proposedChanges ?? eco.proposedChanges
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDraftECO = async (req, res) => {
  const { id } = req.params;
  try {
    const eco = await prisma.eCO.findUnique({ where: { id } });
    if (!eco) return res.status(404).json({ message: "ECO not found" });
    if (!['DRAFT', 'REJECTED'].includes(eco.status)) {
      return res.status(400).json({ message: "Only draft/rejected ECO can be deleted" });
    }
    if (eco.createdById !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Only creator/admin can delete this draft" });
    }

    await prisma.eCO.delete({ where: { id } });
    res.json({ message: "Draft ECO deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminDeleteECO = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.eCO.delete({ where: { id } });
    res.json({ message: "ECO deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminDeleteAllECOs = async (req, res) => {
  try {
    await prisma.eCO.deleteMany({});
    res.json({ message: "All ECO records deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createECO, approveECO, rejectECO, getECOs, updateECOStatus, updateDraftECO, deleteDraftECO, adminDeleteECO, adminDeleteAllECOs };