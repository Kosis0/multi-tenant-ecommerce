const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const resolveTenant = require('../middleware/resolveTenant');
const { authenticateToken } = require('../middleware/authenticate');
const { requireStoreOwnership } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { tenantSettingsSchema } = require('../validators/tenant.validator');
const asyncHandler = require('../utils/asyncHandler');

router.put(
  '/settings',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  validate(tenantSettingsSchema),
  asyncHandler(tenantController.updateSettings)
);

module.exports = router;
