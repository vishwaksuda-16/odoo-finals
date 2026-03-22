const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router.get('/workflow', verifyToken, settingsController.getWorkflowSettings);
router.post('/approval-rules', verifyToken, isAdmin, settingsController.createApprovalRule);
router.delete('/approval-rules/:id', verifyToken, isAdmin, settingsController.deleteApprovalRule);
router.post('/stages', verifyToken, isAdmin, settingsController.createStage);
router.patch('/stages/:id', verifyToken, isAdmin, settingsController.updateStage);
router.delete('/stages/:id', verifyToken, isAdmin, settingsController.deleteStage);

module.exports = router;
