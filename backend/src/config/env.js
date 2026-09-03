import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define Zod schema for environment variables validation
const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL environment variable is required',
  }).min(1, 'DATABASE_URL cannot be empty'),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('Event Booking Platform'),

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Super Admin Credentials
  SUPER_ADMIN_EMAIL: z.string().email().default('admin@eventbooking.com'),
  SUPER_ADMIN_PASSWORD: z.string().default('SuperAdminPassword123!'),

  // SMTP Configuration
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().trim().email('SMTP_USER must be a valid email'),
  SMTP_PASS: z
    .string({ required_error: 'SMTP_PASS is required (Gmail App Password)' })
    .transform((val) =>
      String(val)
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/^["']|["']$/g, '')
        .replace(/\s+/g, '')
    )
    .refine((val) => val.length >= 16, 'SMTP_PASS must be a 16-character Gmail App Password'),
  EMAIL_FROM: z.string().default('Event Booking Platform <info.djempire@gmail.com>'),
});

const envInput = {
  ...process.env,
  SMTP_HOST: process.env.SMTP_HOST || process.env.EMAIL_HOST,
  SMTP_PORT: process.env.SMTP_PORT || process.env.EMAIL_PORT,
  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER,
  SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
};

// Validate process.env against schema
const _env = envSchema.safeParse(envInput);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  throw new Error('Invalid environment variables configuration');
}

export const env = Object.freeze(_env.data);
