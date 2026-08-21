const { z } = require('zod');
const { VALID_ORDER_STATUSES } = require('../constants/orderStatus');

const orderItemSchema = z.object({
  product_id: z.union([z.string(), z.number()]),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(1000),
  variant_id: z.union([z.string(), z.number()]).optional().nullable(),
  variant_info: z.any().optional()
});

const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Items required'),
  paymentMethod: z.string().trim().max(50).optional().default('card'),
  email: z.string().trim().email('Invalid email address').max(255).optional().nullable()
});

const orderStatusUpdateSchema = z.object({
  status: z.enum(VALID_ORDER_STATUSES, {
    errorMap: () => ({ message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}` })
  })
});

module.exports = {
  orderItemSchema,
  orderCreateSchema,
  orderStatusUpdateSchema
};
