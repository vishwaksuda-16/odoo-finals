const express = require('express');
const router = express.Router();
const { getECOReport, getApproverStats } = require('../controllers/reportController');
const { verifyToken, isApprover } = require('../middleware/auth');

// Only Approvers/Admins should see the full audit trail
router.get('/audit', verifyToken, isApprover, getECOReport);
router.get('/approver-stats', verifyToken, isApprover, getApproverStats);

module.exports = router;