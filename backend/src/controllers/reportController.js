const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getECOReport = async (req, res) => {
  try {
    const reports = await prisma.eCO.findMany({
      include: {
        product: true,
        createdBy: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // We can also fetch the AuditLogs for deep traceability
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' }
    });

    res.json({ ecos: reports, auditLogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Get approver stats: approved and rejected counts per approver */
const getApproverStats = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['PRODUCT_VERSION_BUMP', 'ECO_REJECTED'] }
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { timestamp: 'desc' }
    });

    const byUser = {};
    for (const log of logs) {
      const uid = log.userId;
      if (!byUser[uid]) {
        byUser[uid] = {
          userId: uid,
          name: log.user?.name || log.user?.email || 'Unknown',
          email: log.user?.email || '',
          approved: 0,
          rejected: 0
        };
      }
      if (log.action === 'PRODUCT_VERSION_BUMP') byUser[uid].approved++;
      if (log.action === 'ECO_REJECTED') byUser[uid].rejected++;
    }

    const approverList = Object.values(byUser);
    const totals = approverList.reduce(
      (acc, a) => ({ approved: acc.approved + a.approved, rejected: acc.rejected + a.rejected }),
      { approved: 0, rejected: 0 }
    );

    res.json({ approvers: approverList, totals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getECOReport, getApproverStats }; 