const { z } = require('zod');

const reviewSchema = z.object({
  authorName: z.string().trim().max(100).optional().default('Verified Buyer'),
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().min(1, 'Comment is required').max(2000, 'Comment cannot exceed 2000 characters')
});

module.exports = {
  reviewSchema
};
