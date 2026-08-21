const { z } = require('zod');

const checkoutItemSchema = z.object({
  product_id: z.union([z.string(), z.number()]).optional(),
  id: z.union([z.string(), z.number()]).optional(),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
  variant_id: z.union([z.string(), z.number()]).optional().nullable()
}).refine(
  (item) => item.product_id !== undefined || item.id !== undefined,
  { message: 'Each item must have a product_id or id' }
);

const checkoutSessionSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Items required')
});

module.exports = {
  checkoutItemSchema,
  checkoutSessionSchema
};
