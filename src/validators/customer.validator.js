const { z } = require('zod');

const customerRegisterSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100).optional().nullable(),
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  phone: z.string().trim().max(30).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable()
});

const customerLoginSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128)
});

module.exports = {
  customerRegisterSchema,
  customerLoginSchema
};
