const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const resolveTenant = require('../middleware/resolveTenant');
const { authenticateToken, optionalAuthenticateCustomerToken } = require('../middleware/authenticate');
const { requireStoreOwnership } = require('../middleware/authorize');
const { checkoutLimiter } = require('../middleware/rateLimiters');
const validate = require('../middleware/validate');
const { orderCreateSchema, orderStatusUpdateSchema } = require('../validators/order.validator');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/orders — Customer order creation
router.post(
  '/',
  resolveTenant,
  checkoutLimiter,
  optionalAuthenticateCustomerToken,
  validate(orderCreateSchema),
  asyncHandler(orderController.createOrder)
);

// GET /api/orders — Admin orders listing
router.get(
  '/',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  asyncHandler(orderController.listOrders)
);

// PATCH /api/orders/:id — Update status
router.patch(
  '/:id',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  validate(orderStatusUpdateSchema),
  asyncHandler(orderController.updateOrderStatus)
);

// POST /api/orders/:id/pay — Settle order
router.post(
  '/:id/pay',
  resolveTenant,
  authenticateToken,
  requireStoreOwnership,
  asyncHandler(orderController.settleOrder)
);

module.exports = router;
