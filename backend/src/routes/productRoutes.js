const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isCreator } = require('../middleware/auth');
const { validate, productSchema } = require('../middleware/validate');


router.get('/', verifyToken, productController.getAllActiveProducts);
router.get('/:id/history', verifyToken, productController.getProductHistory);
router.post('/', verifyToken, isCreator, validate(productSchema), productController.createProduct);
module.exports = router;