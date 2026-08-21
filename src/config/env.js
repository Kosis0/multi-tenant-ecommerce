const dotenv = require('dotenv');
const { z } = require('zod');

// Load .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_CUSTOMER_SECRET: z.string().optional(),
  DB_POOL_MAX: z.coerce.number().default(20),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('no-reply@mercato.com'),
  CLIENT_URL: z.string().optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('FATAL: Environment validation failed:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

const env = {
  ...parsedEnv.data,
  JWT_CUSTOMER_SECRET: parsedEnv.data.JWT_CUSTOMER_SECRET || parsedEnv.data.JWT_SECRET
};

module.exports = env;
