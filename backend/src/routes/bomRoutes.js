const express = require('express');
const router = express.Router();
const { verifyToken, isCreator } = require('../middleware/auth');
const bomController = require('../controllers/bomController');

router.get('/', verifyToken, bomController.getAllBOMs);
router.get('/:id', verifyToken, bomController.getBOMById);
router.post('/', verifyToken, isCreator, bomController.createBoM);

module.exports = router;
