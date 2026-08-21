const reviewService = require('../services/review.service');
const { sendSuccess } = require('../utils/response');

const listReviews = async (req, res) => {
  const reviews = await reviewService.listProductReviews(req.tenant.id, req.params.id);
  sendSuccess(res, reviews);
};

const createReview = async (req, res) => {
  const newReview = await reviewService.createProductReview(req.tenant.id, req.params.id, {
    authorName: req.body.authorName,
    rating: req.body.rating,
    comment: req.body.comment
  });
  sendSuccess(res, newReview, 201);
};

module.exports = {
  listReviews,
  createReview
};
