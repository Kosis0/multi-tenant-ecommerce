const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiters');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/tenants/register or /api/auth/register
router.post('/tenants/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/auth/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));

// POST /api/auth/login
router.post('/auth/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));

module.exports = router;
