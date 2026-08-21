const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/review.controller');
const resolveTenant = require('../middleware/resolveTenant');
const { reviewLimiter } = require('../middleware/rateLimiters');
const validate = require('../middleware/validate');
const { reviewSchema } = require('../validators/review.validator');
const asyncHandler = require('../utils/asyncHandler');

router.get('/:id/reviews', resolveTenant, asyncHandler(reviewController.listReviews));
router.post(
  '/:id/reviews',
  resolveTenant,
  reviewLimiter,
  validate(reviewSchema),
  asyncHandler(reviewController.createReview)
);

module.exports = router;
