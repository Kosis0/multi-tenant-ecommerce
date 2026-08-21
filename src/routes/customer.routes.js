const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const resolveTenant = require('../middleware/resolveTenant');
const { authenticateCustomerToken } = require('../middleware/authenticate');
const { authLimiter } = require('../middleware/rateLimiters');
const validate = require('../middleware/validate');
const { customerRegisterSchema, customerLoginSchema } = require('../validators/customer.validator');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', resolveTenant, authLimiter, validate(customerRegisterSchema), asyncHandler(customerController.register));
router.post('/login', resolveTenant, authLimiter, validate(customerLoginSchema), asyncHandler(customerController.login));
router.get('/orders', resolveTenant, authenticateCustomerToken, asyncHandler(customerController.getOrders));

module.exports = router;
