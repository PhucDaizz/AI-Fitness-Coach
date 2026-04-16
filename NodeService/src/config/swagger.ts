import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';
import path from 'path';

const ext = __filename.endsWith('.js') ? 'js' : 'ts';

// ─── Swagger definition ─────────────────────────────────────────────────────────
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Fitness Coach — Node.js API',
      version: '1.0.0',
      description:
        'Backend REST API phục vụ ứng dụng AI Fitness Coach. ' +
        'Xác thực bằng JWT do .NET Auth Service phát hành.',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token từ .NET Auth Service. Ví dụ: `Bearer <token>`',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Profile', description: 'Hồ sơ người dùng' },
      { name: 'Exercise', description: 'Danh mục bài tập' },
      { name: 'Workout Plan', description: 'Kế hoạch tập luyện từ AI' },
      { name: 'Workout Log', description: 'Nhật ký buổi tập' },
      { name: 'Streak', description: 'Chuỗi ngày tập liên tiếp' },
      { name: 'Nutrition', description: 'Dinh dưỡng & TDEE' },
      { name: 'Analytics', description: 'Thống kê & dashboard' },
      { name: 'Chat', description: 'Lịch sử chat với AI' },
      { name: 'Health', description: 'Healthcheck endpoint' },
    ],
  },
  // Quét JSDoc trong tất cả route files
  apis: [
    path.join(__dirname, `../routes/*.${ext}`),
    path.join(__dirname, `../controllers/*.${ext}`),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);