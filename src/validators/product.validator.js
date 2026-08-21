const { z } = require('zod');

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Variant name required').max(50),
  value: z.string().trim().min(1, 'Variant value required').max(50),
  stock: z.coerce.number().int().min(0, 'Variant stock cannot be negative').default(0),
  price_adjustment: z.coerce.number().default(0)
});

const productCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  image_url: z.string().trim().url('Valid image URL is required').nullable().optional().or(z.literal('')),
  category: z.string().trim().max(50).default('General'),
  description: z.string().trim().max(5000).default(''),
  original_price: z.coerce.number().min(0).nullable().optional(),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  discount_percent: z.coerce.number().min(0).max(100).default(20),
  flash_sale_units: z.coerce.number().int().min(0).nullable().optional(),
  images: z.union([z.array(z.string().trim()), z.string()]).default([]),
  variants: z.array(variantSchema).default([])
});

const productUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200).optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number').optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').optional(),
  image_url: z.string().trim().url('Valid image URL is required').nullable().optional().or(z.literal('')),
  category: z.string().trim().max(50).optional(),
  description: z.string().trim().max(5000).optional(),
  original_price: z.coerce.number().min(0).nullable().optional(),
  is_featured: z.boolean().optional(),
  is_new_arrival: z.boolean().optional(),
  discount_percent: z.coerce.number().min(0).max(100).optional(),
  flash_sale_units: z.coerce.number().int().min(0).nullable().optional(),
  images: z.union([z.array(z.string().trim()), z.string()]).optional(),
  variants: z.array(variantSchema).optional()
});

module.exports = {
  variantSchema,
  productCreateSchema,
  productUpdateSchema,
  productSchema: productCreateSchema // Alias for backwards compatibility
};
