const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function ensureDefaultStages() {
  const n = await prisma.ecoStage.count();
  if (n > 0) return;
  await prisma.$transaction([
    prisma.ecoStage.create({ data: { name: "New", sortOrder: 1, pipelineKind: "NEW" } }),
    prisma.ecoStage.create({ data: { name: "Approval", sortOrder: 2, pipelineKind: "PENDING" } }),
    prisma.ecoStage.create({ data: { name: "Done", sortOrder: 3, pipelineKind: "TERMINAL" } }),
  ]);
}

async function ecoCountForPipelineKind(kind) {
  switch (kind) {
    case 'NONE':
      return 0;
    case 'DRAFT_SET':
      return prisma.eCO.count({ where: { status: { in: ['DRAFT', 'REJECTED'] } } });
    case 'NEW':
      return prisma.eCO.count({ where: { status: 'NEW' } });
    case 'PENDING':
      return prisma.eCO.count({ where: { status: 'PENDING' } });
    case 'TERMINAL':
      return prisma.eCO.count({ where: { status: 'APPROVED' } });
    default:
      return 0;
  }
}

const getWorkflowSettings = async (req, res) => {
  try {
    await ensureDefaultStages();
    const stages = await prisma.ecoStage.findMany({ orderBy: { sortOrder: 'asc' } });
    const rules = await prisma.ecoApprovalRule.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        stage: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });

    const counts = await Promise.all(stages.map((s) => ecoCountForPipelineKind(s.pipelineKind)));
    const ruleCounts = await Promise.all(
      stages.map((s) => prisma.ecoApprovalRule.count({ where: { stageId: s.id } }))
    );

    res.json({
      stages: stages.map((s, i) => ({
        id: s.id,
        name: s.name,
        order: s.sortOrder,
        pipelineKind: s.pipelineKind,
        ecoCount: counts[i],
        approverCount: ruleCounts[i],
      })),
      rules: rules.map((r) => ({
        id: r.id,
        stageId: r.stageId,
        stageName: r.stage.name,
        userId: r.userId,
        userName: r.user.name || r.user.email,
        approvalType: r.kind,
        productId: r.productId,
        productName: r.product?.name || 'All products',
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Failed to load workflow settings' });
  }
};

const createApprovalRule = async (req, res) => {
  try {
    const { stageId, userId, approvalType, productId } = req.body;
    if (!stageId || !userId) {
      return res.status(400).json({ message: 'stageId and userId are required' });
    }
    const kind = approvalType === 'Optional' ? 'Optional' : 'Required';

    let scopeKey = 'GLOBAL';
    let pid = null;
    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(400).json({ message: 'Product not found' });
      scopeKey = productId;
      pid = productId;
    }

    const rule = await prisma.ecoApprovalRule.create({
      data: { stageId, userId, kind, scopeKey, productId: pid },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        stage: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({
      id: rule.id,
      stageId: rule.stageId,
      stageName: rule.stage.name,
      userId: rule.userId,
      userName: rule.user.name || rule.user.email,
      approvalType: rule.kind,
      productId: rule.productId,
      productName: rule.product?.name || 'All products',
    });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({
        message: 'This approver is already configured for that stage and product scope',
      });
    }
    console.error(e);
    res.status(500).json({ message: e.message || 'Failed to create approval rule' });
  }
};

const deleteApprovalRule = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ecoApprovalRule.delete({ where: { id } });
    res.json({ message: 'Removed' });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ message: 'Rule not found' });
    res.status(500).json({ message: e.message || 'Failed to delete rule' });
  }
};

const createStage = async (req, res) => {
  try {
    const { name, order, pipelineKind } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'name is required' });
    }
    const sortOrder = Number.isFinite(Number(order)) ? Number(order) : (await prisma.ecoStage.count()) + 1;
    const pk = ['NONE', 'DRAFT_SET', 'NEW', 'PENDING', 'TERMINAL'].includes(pipelineKind)
      ? pipelineKind
      : 'NONE';

    const stage = await prisma.ecoStage.create({
      data: { name: name.trim(), sortOrder, pipelineKind: pk },
    });
    res.status(201).json({
      id: stage.id,
      name: stage.name,
      order: stage.sortOrder,
      pipelineKind: stage.pipelineKind,
      ecoCount: 0,
      approverCount: 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Failed to create stage' });
  }
};

const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order, pipelineKind } = req.body;
    const data = {};
    if (typeof name === 'string') data.name = name.trim();
    if (order !== undefined && Number.isFinite(Number(order))) data.sortOrder = Number(order);
    if (pipelineKind !== undefined && ['NONE', 'DRAFT_SET', 'NEW', 'PENDING', 'TERMINAL'].includes(pipelineKind)) {
      data.pipelineKind = pipelineKind;
    }
    const stage = await prisma.ecoStage.update({ where: { id }, data });
    const ecoCount = await ecoCountForPipelineKind(stage.pipelineKind);
    const approverCount = await prisma.ecoApprovalRule.count({ where: { stageId: id } });
    res.json({
      id: stage.id,
      name: stage.name,
      order: stage.sortOrder,
      pipelineKind: stage.pipelineKind,
      ecoCount,
      approverCount,
    });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ message: 'Stage not found' });
    res.status(500).json({ message: e.message || 'Failed to update stage' });
  }
};

const deleteStage = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ecoStage.delete({ where: { id } });
    res.json({ message: 'Stage deleted' });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ message: 'Stage not found' });
    res.status(500).json({ message: e.message || 'Failed to delete stage' });
  }
};

module.exports = {
  getWorkflowSettings,
  createApprovalRule,
  deleteApprovalRule,
  createStage,
  updateStage,
  deleteStage,
};
