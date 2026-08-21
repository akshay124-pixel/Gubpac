import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../database/prisma';
import { logger } from '../config/logger';
import { EmailJobPayload } from '../types';
import { JobStatus } from '@prisma/client';

/**
 * Mock email sending function
 * In production, this would integrate with a real email service
 */
async function sendEmail(payload: EmailJobPayload): Promise<void> {
  logger.info(`📧 Sending email to ${payload.to}`);
  logger.info(`   Subject: ${payload.subject}`);
  logger.info(`   Body: ${payload.body}`);
  
  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  logger.info(`✅ Email sent successfully to ${payload.to}`);
}

/**
 * Email Worker
 * Processes email notification jobs from BullMQ
 */
const emailWorker = new Worker<EmailJobPayload>(
  'email-notifications',
  async (job: Job<EmailJobPayload>) => {
    logger.info(`Processing job ${job.id} (attempt ${job.attemptsMade + 1})`);

    try {
      // Update job status to active
      await prisma.backgroundJob.updateMany({
        where: { jobId: job.id as string },
        data: {
          status: JobStatus.active,
          attempts: job.attemptsMade + 1,
        },
      });

      // Send email
      await sendEmail(job.data);

      // Update job status to completed
      await prisma.backgroundJob.updateMany({
        where: { jobId: job.id as string },
        data: {
          status: JobStatus.completed,
          completedAt: new Date(),
          result: 'Email sent successfully',
        },
      });

      return { success: true };
    } catch (error) {
      logger.error(`Error processing job ${job.id}:`, error);

      // Update job attempts
      await prisma.backgroundJob.updateMany({
        where: { jobId: job.id as string },
        data: {
          attempts: job.attemptsMade + 1,
          result: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error; // Re-throw to trigger BullMQ retry
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

// Handle completed jobs
emailWorker.on('completed', (job) => {
  logger.info(`✅ Job ${job.id} completed successfully`);
});

// Handle failed jobs
emailWorker.on('failed', async (job, error) => {
  if (!job) {
    logger.error('Job failed but job object is undefined');
    return;
  }

  logger.error(`❌ Job ${job.id} failed after ${job.attemptsMade} attempts:`, error);

  // If all retries exhausted, mark as failed (Dead Letter Queue)
  if (job.attemptsMade >= (job.opts.attempts || 3)) {
    logger.error(`💀 Job ${job.id} moved to dead letter queue after ${job.attemptsMade} attempts`);

    await prisma.backgroundJob.updateMany({
      where: { jobId: job.id as string },
      data: {
        status: JobStatus.failed,
        result: `Failed after ${job.attemptsMade} attempts: ${error.message}`,
      },
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing email worker...');
  await emailWorker.close();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing email worker...');
  await emailWorker.close();
  await redis.quit();
  process.exit(0);
});

logger.info('👷 Email worker started and listening for jobs');

export default emailWorker;
