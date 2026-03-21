const express = require('express');
const router = express.Router();
const ecoController = require('../controllers/ecoController');
const bomController = require('../controllers/bomController');
const { verifyToken, isApprover, isCreator, isAdmin } = require('../middleware/auth');

// Anyone logged in can propose a change
router.get('/', verifyToken, ecoController.getECOs);
router.post('/', verifyToken, isCreator, ecoController.createECO);
router.put('/:id', verifyToken, isCreator, ecoController.updateDraftECO);
router.delete('/:id', verifyToken, isCreator, ecoController.deleteDraftECO);
router.patch('/:id/status', verifyToken, isCreator, ecoController.updateECOStatus);
router.delete('/admin/:id', verifyToken, isAdmin, ecoController.adminDeleteECO);
router.delete('/admin/all', verifyToken, isAdmin, ecoController.adminDeleteAllECOs);

// Only Approvers can finalize a version
router.patch('/:id/approve', verifyToken, isApprover, ecoController.approveECO);
router.patch('/:id/reject', verifyToken, isApprover, ecoController.rejectECO);
router.patch('/:id/approve-bom', verifyToken, isApprover, bomController.approveBoMECO);

module.exports = router;