import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env, isDev } from './config/env.ts';
import { swaggerSpec } from './config/swagger.ts';
import routes from './routes/index';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

export function createApp(): Application {
  const app = express();

  // ─── Security headers ──────────────────────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ──────────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ─── Body parsers ──────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── HTTP logging (morgan) ─────────────────────────────────────────────────────
  app.use(morgan(isDev ? 'dev' : 'combined'));

  // ─── Rate limiting ─────────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Quá nhiều yêu cầu — vui lòng thử lại sau 15 phút',
    },
  });
  app.use(env.API_PREFIX, limiter);

  // ─── Swagger UI (chỉ trên dev) ─────────────────────────────────────────────────
  if (isDev) {
    app.use(
      `${env.API_PREFIX}/docs`,
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'AI Fitness Coach API',
        swaggerOptions: { persistAuthorization: true },
      }),
    );
    console.log(`📖  Swagger UI: http://localhost:${env.PORT}${env.API_PREFIX}/docs`);
  }

  // ─── API routes ────────────────────────────────────────────────────────────────
  app.use(env.API_PREFIX, routes);

  // ─── 404 ───────────────────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Error handler (phải đặt cuối cùng) ────────────────────────────────────────
  app.use(errorHandler);

  return app;
}