const { z } = require('zod');

const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID identifier')
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional()
});

const tenantQuerySchema = z.object({
  tenant: z.string().trim().min(1, 'Tenant slug required').optional()
});

module.exports = {
  uuidParamSchema,
  paginationQuerySchema,
  tenantQuerySchema
};
