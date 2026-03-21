const express = require('express');
const router = express.Router();
const ecoController = require('../controllers/ecoController');
const bomController = require('../controllers/bomController');
const { verifyToken, isApprover } = require('../middleware/auth');

// Anyone logged in can propose a change
router.post('/', verifyToken, ecoController.createECO);

// Only Approvers can finalize a version bump
router.patch('/:id/approve', verifyToken, isApprover, ecoController.approveECO);
router.patch('/:id/approve-bom', verifyToken, isApprover, bomController.approveBoMECO);
router.get('/products/:id/bom', verifyToken, bomController.getProductBoM); // NEW
router.post('/bom', verifyToken, bomController.createBoM); // NEW

module.exports = router;