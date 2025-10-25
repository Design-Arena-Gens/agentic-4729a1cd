import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { IMAGE_QUEUE, INDEX_QUEUE, NOTIFY_QUEUE } from './jobs/queues';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const imageQueue = new Queue(IMAGE_QUEUE, { connection });
const indexQueue = new Queue(INDEX_QUEUE, { connection });
const notifyQueue = new Queue(NOTIFY_QUEUE, { connection });

new Worker(IMAGE_QUEUE, async (job) => {
  console.log('Process image job', job.id, job.data);
}, { connection });

new Worker(INDEX_QUEUE, async (job) => {
  console.log('Index job', job.id, job.data);
}, { connection });

new Worker(NOTIFY_QUEUE, async (job) => {
  console.log('Notify job', job.id, job.data);
}, { connection });

new QueueEvents(IMAGE_QUEUE, { connection });
new QueueEvents(INDEX_QUEUE, { connection });
new QueueEvents(NOTIFY_QUEUE, { connection });

console.log('Worker started');
