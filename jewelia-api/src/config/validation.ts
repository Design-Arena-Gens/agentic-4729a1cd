import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().optional(),
  JWT_REFRESH_TTL: z.string().optional(),
  REDIS_URL: z.string(),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  ASSETS_CDN_BASE: z.string().url().optional(),
  SWAGGER_ENABLE: z.string().optional(),
});

export type EnvVars = z.infer<typeof envSchema>;
