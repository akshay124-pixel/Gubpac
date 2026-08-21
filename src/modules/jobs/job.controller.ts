import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { JobService } from './job.service';

const jobService = new JobService();

export class JobController {
  async getJobStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const job = await jobService.getJobStatus(id, req.orgId!);

      res.status(200).json({
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }
}
