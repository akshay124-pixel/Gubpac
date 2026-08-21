import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('10'),
  EMAIL_FROM: z.string().email().default('noreply@taskflow.com'),
  EMAIL_ENABLED: z.string().default('true'),
  JOB_ATTEMPTS: z.string().default('3'),
  JOB_BACKOFF_DELAY: z.string().default('1000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = {
  NODE_ENV: parsed.data.NODE_ENV,
  PORT: parseInt(parsed.data.PORT, 10),
  DATABASE_URL: parsed.data.DATABASE_URL,
  REDIS_HOST: parsed.data.REDIS_HOST,
  REDIS_PORT: parseInt(parsed.data.REDIS_PORT, 10),
  JWT_ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: parsed.data.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY: parsed.data.JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY: parsed.data.JWT_REFRESH_EXPIRY,
  RATE_LIMIT_WINDOW_MS: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
  EMAIL_FROM: parsed.data.EMAIL_FROM,
  EMAIL_ENABLED: parsed.data.EMAIL_ENABLED === 'true',
  JOB_ATTEMPTS: parseInt(parsed.data.JOB_ATTEMPTS, 10),
  JOB_BACKOFF_DELAY: parseInt(parsed.data.JOB_BACKOFF_DELAY, 10),
};
