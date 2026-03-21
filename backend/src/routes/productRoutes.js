const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');

// Public or Protected depending on preference
router.get('/', verifyToken, productController.getAllActiveProducts);
router.get('/:id/history', verifyToken, productController.getProductHistory);
router.post('/', verifyToken, productController.createProduct);

module.exports = router;