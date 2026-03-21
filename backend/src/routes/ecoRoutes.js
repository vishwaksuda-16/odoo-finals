const express = require('express');
const router = express.Router();
const ecoController = require('../controllers/ecoController');
const bomController = require('../controllers/bomController');
const { verifyToken, isApprover } = require('../middleware/auth');

// Anyone logged in can propose a change
router.get('/', verifyToken, ecoController.getECOs);
router.post('/', verifyToken, ecoController.createECO);
router.patch('/:id/status', verifyToken, ecoController.updateECOStatus);

// Only Approvers can finalize a version
router.patch('/:id/approve', verifyToken, isApprover, ecoController.approveECO);
router.patch('/:id/approve-bom', verifyToken, isApprover, bomController.approveBoMECO);

module.exports = router;