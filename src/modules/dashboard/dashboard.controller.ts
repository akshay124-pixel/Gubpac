import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { DashboardService } from './dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  async getTaskStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getTaskStats(req.orgId!);

      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}
