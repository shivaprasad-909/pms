import { Queue, Worker, Job } from 'bullmq';
import redisClient from '../config/redis';

export const emailQueueName = 'email-queue';

export const emailQueue = redisClient 
  ? new Queue(emailQueueName, { connection: redisClient })
  : null;

export const enqueueEmail = async (to: string, subject: string, body: string) => {
  if (!emailQueue) {
    console.log(`[Mock Queue] Sending email to ${to}: ${subject}`);
    return;
  }
  await emailQueue.add('send-email', { to, subject, body });
};

// Initialize worker only if redis is available
export const startEmailWorker = () => {
  if (!redisClient) return;

  const worker = new Worker(emailQueueName, async (job: Job) => {
    const { to, subject, body } = job.data;
    console.log(`[Worker] Processing email job ${job.id} for ${to}`);
    // Here you would integrate with SendGrid, AWS SES, or NodeMailer
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
    console.log(`[Worker] Successfully sent email to ${to}`);
  }, { connection: redisClient });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
  });

  console.log('✅ Email Background Worker started');
};
