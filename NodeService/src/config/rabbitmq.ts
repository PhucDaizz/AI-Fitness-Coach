import amqplib from 'amqplib';
import { env } from './env';

type ChannelModel = Awaited<ReturnType<typeof amqplib.connect>>;
type Channel = Awaited<ReturnType<ChannelModel['createChannel']>>;

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isConnecting = false;

const QUEUES = [
  env.RABBITMQ_QUEUE_PLAN_GENERATED,
  env.RABBITMQ_QUEUE_PLAN_ADJUSTED,
  env.RABBITMQ_QUEUE_WORKOUT_FEEDBACK,
];

export async function connectRabbitMQ(): Promise<void> {
  if (!env.RABBITMQ_ENABLED) {
    console.log('⏭️   RabbitMQ disabled (RABBITMQ_ENABLED=false) — bỏ qua kết nối');
    return;
  }

  if (isConnecting) return;
  isConnecting = true;

  try {
    connection = await amqplib.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();

    for (const queue of QUEUES) {
      await channel.assertQueue(queue, { durable: true });
    }

    console.log('✅  RabbitMQ connected, queues declared:', QUEUES.join(', '));

    connection.on('error', (err: Error) => {
      console.error('❌  RabbitMQ connection error:', err.message);
      scheduleReconnect();
    });

    connection.on('close', () => {
      console.warn('⚠️   RabbitMQ connection closed — đang thử kết nối lại...');
      scheduleReconnect();
    });
  } catch (error) {
    console.error('❌  RabbitMQ connection failed:', error);
    scheduleReconnect();
  } finally {
    isConnecting = false;
  }
}

let reconnectAttempts = 0;
function scheduleReconnect(): void {
  if (!env.RABBITMQ_ENABLED) return;

  connection = null;
  channel = null;
  reconnectAttempts++;
  const delay = Math.min(reconnectAttempts * 2_000, 30_000);
  console.log(`🔄  RabbitMQ reconnecting in ${delay / 1000}s (attempt #${reconnectAttempts})...`);
  setTimeout(() => connectRabbitMQ(), delay);
}

export async function disconnectRabbitMQ(): Promise<void> {
  if (!env.RABBITMQ_ENABLED) return;
  try {
    await channel?.close();
    await connection?.close();
    console.log('🔌  RabbitMQ disconnected');
  } catch {
    // ignore
  }
}

export function getRabbitChannel(): Channel {
  if (!channel) throw new Error('RabbitMQ channel chưa được khởi tạo');
  return channel;
}

export function getRabbitConnection(): ChannelModel {
  if (!connection) throw new Error('RabbitMQ connection chưa được khởi tạo');
  return connection;
}