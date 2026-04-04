import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// ─── Schema định nghĩa & validate toàn bộ biến môi trường ─────────────────────
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(3000),
  API_PREFIX: z.string().default('/api/v1'),

  // MongoDB
  MONGODB_URI: z.string().url('MONGODB_URI phải là một URL hợp lệ'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // RabbitMQ
  RABBITMQ_URL: z.string().url('RABBITMQ_URL phải là một URL hợp lệ'),
  RABBITMQ_QUEUE_PLAN_GENERATED: z.string().default('plan.generated'),
  RABBITMQ_QUEUE_PLAN_ADJUSTED: z.string().default('plan.adjusted'),
  RABBITMQ_QUEUE_WORKOUT_FEEDBACK: z.string().default('workout.feedback'),

  // JWT (token được ký bởi .NET Auth Service)
  JWT_SECRET: z.string().min(16, 'JWT_SECRET phải có ít nhất 16 ký tự'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Rate Limit
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900_000), // 15 phút
  RATE_LIMIT_MAX: z.coerce.number().positive().default(100),
});

// ─── Parse & validate — throw ngay nếu thiếu/sai biến môi trường ──────────────
const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌  Biến môi trường không hợp lệ:\n');
  _parsed.error.issues.forEach((issue) => {
    console.error(`   [${issue.path.join('.')}] ${issue.message}`);
  });
  process.exit(1);
}

export const env = _parsed.data;

// ─── Convenience helpers ────────────────────────────────────────────────────────
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';