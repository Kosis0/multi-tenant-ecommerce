const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout.controller');
const resolveTenant = require('../middleware/resolveTenant');
const { checkoutLimiter } = require('../middleware/rateLimiters');
const validate = require('../middleware/validate');
const { checkoutSessionSchema } = require('../validators/checkout.validator');
const asyncHandler = require('../utils/asyncHandler');

router.post(
  '/create-session',
  resolveTenant,
  checkoutLimiter,
  validate(checkoutSessionSchema),
  asyncHandler(checkoutController.createSession)
);

module.exports = router;
