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

module.exports = { getECOReport }; 