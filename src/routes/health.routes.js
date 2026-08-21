const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(healthController.getHealth));

module.exports = router;
