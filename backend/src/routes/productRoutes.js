const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');
const { validate, productSchema } = require('../middleware/validate');


router.get('/', productController.getAllActiveProducts);
router.get('/:id/history', verifyToken, productController.getProductHistory);
router.post('/', verifyToken, validate(productSchema), productController.createProduct);
module.exports = router;