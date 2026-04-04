import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { connectRabbitMQ, disconnectRabbitMQ } from './config/rabbitmq';

async function bootstrap(): Promise<void> {
  // ─── Kết nối các service bên ngoài ──────────────────────────────────────────
  await connectDatabase();
  await connectRedis();
  await connectRabbitMQ();

  // ─── Khởi tạo Express app ────────────────────────────────────────────────────
  const app = createApp();
  const server = http.createServer(app);

  // ─── WebSocket sẽ attach vào server này ở Phase 5 ───────────────────────────
  // initNotificationGateway(server);

  // ─── RabbitMQ consumers sẽ start ở Phase 5 ──────────────────────────────────
  // await startPlanConsumer();

  // ─── Start listening ─────────────────────────────────────────────────────────
  server.listen(env.PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║     🏋️  AI Fitness Coach — Node.js Service     ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  ENV   : ${env.NODE_ENV.padEnd(35)}║`);
    console.log(`║  PORT  : ${String(env.PORT).padEnd(35)}║`);
    console.log(`║  PREFIX: ${env.API_PREFIX.padEnd(35)}║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
  });

  // ─── Graceful shutdown ────────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    console.log(`\n📴  Nhận ${signal} — đang dừng server...`);
    server.close(async () => {
      await Promise.all([disconnectDatabase(), disconnectRedis(), disconnectRabbitMQ()]);
      console.log('✅  Server đã dừng an toàn');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ─── Bắt lỗi không được xử lý ────────────────────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    console.error('❌  Unhandled rejection:', reason);
    process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌  Uncaught exception:', error);
    process.exit(1);
  });
}

bootstrap();