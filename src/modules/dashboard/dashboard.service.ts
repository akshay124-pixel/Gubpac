import { prisma } from '../../database/prisma';
import { TaskStatus } from '@prisma/client';

export class DashboardService {
  /**
   * Get task counts by status for the organization
   */
  async getTaskStats(orgId: string) {
    // Get all tasks for the organization
    const tasks = await prisma.task.findMany({
      where: {
        deletedAt: null,
        project: {
          orgId,
          deletedAt: null,
        },
      },
      select: {
        status: true,
      },
    });

    // Count tasks by status
    const stats = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };

    tasks.forEach((task) => {
      if (task.status === TaskStatus.todo) {
        stats.todo++;
      } else if (task.status === TaskStatus.in_progress) {
        stats.in_progress++;
      } else if (task.status === TaskStatus.review) {
        stats.review++;
      } else if (task.status === TaskStatus.done) {
        stats.done++;
      }
    });

    return stats;
  }
}
