import { Queue } from 'bullmq';
export declare const emailQueueName = "email-queue";
export declare const emailQueue: Queue<any, any, string, any, any, string>;
export declare const enqueueEmail: (to: string, subject: string, body: string) => Promise<void>;
export declare const startEmailWorker: () => void;
//# sourceMappingURL=emailWorker.d.ts.map