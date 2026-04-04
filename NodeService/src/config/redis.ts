import Redis from 'ioredis';
import { env } from './env';

// ─── Khởi tạo Redis client ─────────────────────────────────────────────────────
const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    // Exponential backoff, tối đa 30 giây
    const delay = Math.min(times * 500, 30_000);
    console.warn(`⚠️   Redis retry attempt #${times}, next retry in ${delay}ms`);
    return delay;
  },
  enableReadyCheck: true,
  lazyConnect: true, // kết nối thủ công trong connectRedis()
});

// ─── Event listeners ────────────────────────────────────────────────────────────
redisClient.on('connect', () => console.log('✅  Redis connected'));
redisClient.on('ready', () => console.log('✅  Redis ready'));
redisClient.on('error', (err) => console.error('❌  Redis error:', err));
redisClient.on('close', () => console.warn('⚠️   Redis connection closed'));

// ─── Connect ────────────────────────────────────────────────────────────────────
export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌  Redis connection failed:', error);
    // Redis không phải critical → log lỗi nhưng không tắt app
  }
}

// ─── Disconnect ─────────────────────────────────────────────────────────────────
export async function disconnectRedis(): Promise<void> {
  await redisClient.quit();
  console.log('🔌  Redis disconnected');
}

export { redisClient };