import { prisma } from '../database/prisma';
import { emailQueue } from '../queues/email.queue';
import { logger } from '../config/logger';
import { JobStatus } from '@prisma/client';

/**
 * Outbox Event Dispatcher
 * 
 * This service implements the transactional outbox pattern.
 * It periodically checks for undispatched outbox events and dispatches them to BullMQ.
 * 
 * This ensures that if a task assignment is saved but the job enqueueing fails,
 * the event will eventually be retried and dispatched.
 */
export class OutboxDispatcher {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly pollInterval = 5000; // 5 seconds

  start() {
    if (this.isRunning) {
      logger.warn('Outbox dispatcher is already running');
      return;
    }

    this.isRunning = true;
    logger.info('🚀 Starting outbox event dispatcher');

    // Start polling for undispatched events
    this.intervalId = setInterval(() => {
      this.processOutboxEvents().catch((error) => {
        logger.error('Error processing outbox events:', error);
      });
    }, this.pollInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('🛑 Stopped outbox event dispatcher');
  }

  private async processOutboxEvents() {
    try {
      // Find undispatched events (limit to 100 per batch)
      const events = await prisma.outboxEvent.findMany({
        where: {
          dispatched: false,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 100,
      });

      if (events.length === 0) {
        return;
      }

      logger.debug(`Found ${events.length} undispatched outbox events`);

      for (const event of events) {
        try {
          await this.dispatchEvent(event);
        } catch (error) {
          logger.error(`Failed to dispatch event ${event.id}:`, error);
          
          // Update attempts count
          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              attempts: event.attempts + 1,
            },
          });
        }
      }
    } catch (error) {
      logger.error('Error fetching outbox events:', error);
    }
  }

  private async dispatchEvent(event: { id: string; eventType: string; payload: string }) {
    if (event.eventType === 'task.assigned') {
      const payload = JSON.parse(event.payload);

      // Get task and org info
      const task = await prisma.task.findUnique({
        where: { id: payload.taskId },
        include: {
          project: {
            select: {
              orgId: true,
            },
          },
        },
      });

      // Create background job record
      const backgroundJob = await prisma.backgroundJob.create({
        data: {
          jobId: '', // Will be updated with BullMQ job ID
          jobType: 'email-notification',
          status: JobStatus.pending,
          payload: event.payload,
          orgId: task?.project.orgId,
        },
      });

      // Add job to BullMQ queue
      const job = await emailQueue.add('task-assignment-notification', {
        to: payload.userEmail,
        subject: `You've been assigned to task: ${payload.taskTitle}`,
        body: `You have been assigned to the task "${payload.taskTitle}".`,
        taskId: payload.taskId,
        assignedBy: payload.assignedBy,
      }, {
        jobId: backgroundJob.id,
      });

      // Update background job record with BullMQ job ID
      await prisma.backgroundJob.update({
        where: { id: backgroundJob.id },
        data: {
          jobId: job.id as string,
        },
      });

      // Mark outbox event as dispatched
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          dispatched: true,
          dispatchedAt: new Date(),
        },
      });

      logger.info(`Dispatched outbox event ${event.id} to BullMQ job ${job.id}`);
    }
  }
}
