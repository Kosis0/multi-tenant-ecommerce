const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const resolveTenant = require('../middleware/resolveTenant');
const { authenticateToken } = require('../middleware/authenticate');
const { requireStoreOwnership } = require('../middleware/authorize');
const { uploadLimiter } = require('../middleware/rateLimiters');
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');

router.post(
  '/',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  uploadLimiter,
  upload.single('image'),
  asyncHandler(uploadController.uploadImage)
);

module.exports = router;
