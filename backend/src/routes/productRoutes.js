const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isCreator, isAdmin } = require('../middleware/auth');
const { validate, productSchema } = require('../middleware/validate');


router.get('/', verifyToken, productController.getAllActiveProducts);
router.get('/archived', verifyToken, productController.getArchivedProducts);
router.get('/:id/history', verifyToken, productController.getProductHistory);
router.get('/:id', verifyToken, productController.getProductById);
router.post('/', verifyToken, isCreator, validate(productSchema), productController.createProduct);
router.patch('/:id/archive', verifyToken, isCreator, productController.archiveProduct);
router.patch('/:id/unarchive', verifyToken, isCreator, productController.unarchiveProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);
router.delete('/', verifyToken, isAdmin, productController.deleteAllProducts);
module.exports = router;