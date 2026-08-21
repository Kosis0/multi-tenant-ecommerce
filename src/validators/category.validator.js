const { z } = require('zod');

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50),
  icon: z.string().trim().max(20).optional().nullable()
});

const categoryUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50).optional(),
  icon: z.string().trim().max(20).optional()
});

module.exports = {
  categorySchema,
  categoryUpdateSchema
};
