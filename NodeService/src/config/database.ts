import mongoose from 'mongoose';
import { env } from './env';

// ─── Mongoose connection options ────────────────────────────────────────────────
const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  autoIndex: env.NODE_ENV !== 'production', // tắt autoIndex trên production
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 45_000,
};

// ─── Connect ────────────────────────────────────────────────────────────────────
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, MONGOOSE_OPTIONS);
    console.log('✅  MongoDB connected:', mongoose.connection.host);
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error);
    process.exit(1);
  }
}

// ─── Disconnect (dùng khi test / graceful shutdown) ─────────────────────────────
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('🔌  MongoDB disconnected');
}

// ─── Event listeners ────────────────────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️   MongoDB disconnected — đang thử kết nối lại...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌  MongoDB error:', err);
});