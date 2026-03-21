const express = require('express');
const router = express.Router();
const { verifyToken, isCreator, isAdmin } = require('../middleware/auth');
const bomController = require('../controllers/bomController');

router.get('/', verifyToken, bomController.getAllBOMs);
router.get('/:id', verifyToken, bomController.getBOMById);
router.post('/', verifyToken, isCreator, bomController.createBoM);
router.delete('/:id', verifyToken, isAdmin, bomController.deleteBoM);
router.delete('/', verifyToken, isAdmin, bomController.deleteAllBoMs);

module.exports = router;
