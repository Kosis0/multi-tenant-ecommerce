const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const resolveTenant = require('../middleware/resolveTenant');
const { authenticateToken } = require('../middleware/authenticate');
const { requireStoreOwnership } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { productCreateSchema, productUpdateSchema } = require('../validators/product.validator');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', resolveTenant, asyncHandler(productController.listProducts));
router.get('/:id', resolveTenant, asyncHandler(productController.getProductById));
router.post(
  '/',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  validate(productCreateSchema),
  asyncHandler(productController.createProduct)
);
router.put(
  '/:id',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  validate(productUpdateSchema),
  asyncHandler(productController.updateProduct)
);
router.delete(
  '/:id',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  asyncHandler(productController.deleteProduct)
);

module.exports = router;
