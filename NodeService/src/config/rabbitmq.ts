import amqplib from 'amqplib';
import { env } from './env';

type ChannelModel = Awaited<ReturnType<typeof amqplib.connect>>;
type Channel = Awaited<ReturnType<ChannelModel['createChannel']>>;

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isConnecting = false;
let reconnectAttempts = 0;

const MAX_RECONNECT_ATTEMPTS = 10;

const QUEUES = [
  env.RABBITMQ_QUEUE_PLAN_GENERATED,
  env.RABBITMQ_QUEUE_PLAN_ADJUSTED,
  env.RABBITMQ_QUEUE_WORKOUT_FEEDBACK,
];

export async function connectRabbitMQ(): Promise<void> {
  if (isConnecting) return;
  isConnecting = true;

  try {
    connection = await amqplib.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();

    for (const queue of QUEUES) {
      await channel.assertQueue(queue, { durable: true });
    }

    // Reset counter khi connect thành công
    reconnectAttempts = 0;
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
    const err = error as Error;
    console.error(`❌  RabbitMQ connection failed (attempt #${reconnectAttempts + 1}): ${err.message}`);
    scheduleReconnect();
  } finally {
    isConnecting = false;
  }
}

function scheduleReconnect(): void {
  connection = null;
  channel = null;
  reconnectAttempts++;

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(
      `🚫  RabbitMQ: đã thử ${MAX_RECONNECT_ATTEMPTS} lần, dừng reconnect. ` +
      `Kiểm tra lại RABBITMQ_URL và khởi động lại service.`
    );
    return;
  }

  const delay = Math.min(reconnectAttempts * 2_000, 30_000);
  console.log(`🔄  RabbitMQ reconnecting in ${delay / 1000}s (attempt #${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  setTimeout(() => connectRabbitMQ(), delay);
}

export async function disconnectRabbitMQ(): Promise<void> {
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