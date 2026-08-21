const { z } = require('zod');
const RESERVED_SLUGS = require('../constants/reservedSlugs');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Store name must be at least 2 characters').max(100),
  slug: z
    .string()
    .trim()
    .min(2, 'Store slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .refine(
      (slug) => !RESERVED_SLUGS.has(slug.toLowerCase()),
      { message: 'Slug is a reserved system identifier and cannot be used.' }
    ),
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128),
  tenantSlug: z.string().trim().optional()
});

module.exports = {
  registerSchema,
  loginSchema
};
