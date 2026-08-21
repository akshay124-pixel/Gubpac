import { prisma } from '../../database/prisma';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export class JobService {
  /**
   * Get job status by ID
   * Ensures job belongs to the user's organization
   */
  async getJobStatus(jobId: string, orgId: string) {
    const job = await prisma.backgroundJob.findUnique({
      where: { jobId },
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    // Verify job belongs to the user's organization
    if (job.orgId && job.orgId !== orgId) {
      throw new ForbiddenError('You do not have access to this job');
    }

    return {
      id: job.id,
      jobId: job.jobId,
      jobType: job.jobType,
      status: job.status,
      attempts: job.attempts,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
    };
  }
}
