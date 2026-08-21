const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const asyncHandler = require('../utils/asyncHandler');

router.post('/stripe', asyncHandler(webhookController.handleStripe));

module.exports = router;
