const { z } = require('zod');

const wishlistAddSchema = z.object({
  sessionId: z.string().trim().min(1, 'Session ID required').max(100),
  productId: z.union([z.string(), z.number()])
});

const wishlistQuerySchema = z.object({
  sessionId: z.string().trim().min(1, 'Session ID required').max(100)
});

module.exports = {
  wishlistAddSchema,
  wishlistQuerySchema,
  wishlistSchema: wishlistAddSchema // Alias
};
