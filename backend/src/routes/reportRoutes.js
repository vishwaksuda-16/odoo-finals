const express = require('express');
const router = express.Router();
const { getECOReport } = require('../controllers/reportController');
const { verifyToken, isApprover } = require('../middleware/auth');

// Only Approvers/Admins should see the full audit trail
router.get('/audit', verifyToken, isApprover, getECOReport);

module.exports = router;