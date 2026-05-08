"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmailWorker = exports.enqueueEmail = exports.emailQueue = exports.emailQueueName = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
exports.emailQueueName = 'email-queue';
exports.emailQueue = redis_1.default
    ? new bullmq_1.Queue(exports.emailQueueName, { connection: redis_1.default })
    : null;
const enqueueEmail = async (to, subject, body) => {
    if (!exports.emailQueue) {
        console.log(`[Mock Queue] Sending email to ${to}: ${subject}`);
        return;
    }
    await exports.emailQueue.add('send-email', { to, subject, body });
};
exports.enqueueEmail = enqueueEmail;
// Initialize worker only if redis is available
const startEmailWorker = () => {
    if (!redis_1.default)
        return;
    const worker = new bullmq_1.Worker(exports.emailQueueName, async (job) => {
        const { to, subject, body } = job.data;
        console.log(`[Worker] Processing email job ${job.id} for ${to}`);
        // Here you would integrate with SendGrid, AWS SES, or NodeMailer
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
        console.log(`[Worker] Successfully sent email to ${to}`);
    }, { connection: redis_1.default });
    worker.on('completed', (job) => {
        console.log(`Job ${job.id} has completed!`);
    });
    worker.on('failed', (job, err) => {
        console.error(`Job ${job?.id} has failed with ${err.message}`);
    });
    console.log('✅ Email Background Worker started');
};
exports.startEmailWorker = startEmailWorker;
//# sourceMappingURL=emailWorker.js.map