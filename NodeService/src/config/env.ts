import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// ─── Helper: parse boolean từ string env ("true"/"false"/"1"/"0") ───────────────
// Dùng thay z.coerce.boolean() vì Boolean("false") = true trong JS
const booleanFromString = z
  .string()
  .transform((v) => v === "true" || v === "1")
  .or(z.boolean())
  .default(true);

const booleanFromStringDefault = (defaultVal: boolean) =>
  z
    .string()
    .transform((v) => v === "true" || v === "1")
    .or(z.boolean())
    .default(defaultVal);

const envSchema = z.object({
  // App
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().positive().default(3000),
  API_PREFIX: z.string().default("/api/v1"),

  // MongoDB
  MONGODB_URI: z.string().url("MONGODB_URI phải là một URL hợp lệ"),

  // Redis — tắt khi chưa có Redis server
  REDIS_ENABLED: booleanFromString,
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // RabbitMQ — tắt khi chưa có RabbitMQ server
  RABBITMQ_ENABLED: booleanFromString,
  RABBITMQ_URL: z.string().default("amqp://guest:guest@localhost:5672"),
  RABBITMQ_QUEUE_PLAN_GENERATED: z.string().default("plan.generated"),
  RABBITMQ_QUEUE_PLAN_ADJUSTED: z.string().default("plan.adjusted"),
  RABBITMQ_QUEUE_WORKOUT_FEEDBACK: z.string().default("workout.feedback"),

  // JWT (token được ký bởi .NET Auth Service)
  JWT_SECRET: z.string().min(16, "JWT_SECRET phải có ít nhất 16 ký tự"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Rate Limit — tắt khi dev
  RATE_LIMIT_ENABLED: booleanFromString,
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(100),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error("❌  Biến môi trường không hợp lệ:\n");
  _parsed.error.issues.forEach((issue) => {
    console.error(`   [${issue.path.join(".")}] ${issue.message}`);
  });
  process.exit(1);
}

export const env = _parsed.data;

// ─── Log trạng thái các flag khi khởi động ──────────────────────────────────────
console.log(
  `🔧  REDIS_ENABLED=${env.REDIS_ENABLED} | RABBITMQ_ENABLED=${env.RABBITMQ_ENABLED} | RATE_LIMIT_ENABLED=${env.RATE_LIMIT_ENABLED}`,
);

export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
