const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const resolveTenant = require('../middleware/resolveTenant');
const { authenticateToken } = require('../middleware/authenticate');
const { requireStoreOwnership } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { categorySchema, categoryUpdateSchema } = require('../validators/category.validator');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', resolveTenant, asyncHandler(categoryController.listCategories));
router.post(
  '/',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  validate(categorySchema),
  asyncHandler(categoryController.createCategory)
);
router.put(
  '/:id',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  validate(categoryUpdateSchema),
  asyncHandler(categoryController.updateCategory)
);
router.delete(
  '/:id',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  asyncHandler(categoryController.deleteCategory)
);

module.exports = router;
