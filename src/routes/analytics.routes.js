const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const resolveTenant = require('../middleware/resolveTenant');
const { authenticateToken } = require('../middleware/authenticate');
const { requireStoreOwnership } = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');

router.get(
  '/stats',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  asyncHandler(analyticsController.getStats)
);

module.exports = router;
