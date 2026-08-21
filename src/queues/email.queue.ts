import { Queue } from 'bullmq';
import { redis } from '../config/redis';
import { env } from '../config/env';
import { EmailJobPayload } from '../types';

export const emailQueue = new Queue<EmailJobPayload>('email-notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: env.JOB_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: env.JOB_BACKOFF_DELAY,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: false, // Keep failed jobs for inspection
  },
});
