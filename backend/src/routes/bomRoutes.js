const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const bomController = require('../controllers/bomController');

router.get('/', verifyToken, bomController.getAllBOMs);
router.get('/:id', verifyToken, bomController.getBOMById);
router.post('/', verifyToken, bomController.createBoM);

module.exports = router;
