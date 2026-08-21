import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { AssignmentService } from './assignment.service';
import { AssignUserInput } from './assignment.validation';

const assignmentService = new AssignmentService();

export class AssignmentController {
  async assignUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const data = req.body as AssignUserInput;
      const assignment = await assignmentService.assignUser(
        taskId,
        data,
        req.orgId!,
        req.user!.userId
      );

      res.status(201).json({
        message: 'User assigned to task successfully',
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  async unassignUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId, userId } = req.params;
      const result = await assignmentService.unassignUser(taskId, userId, req.orgId!);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTaskAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const assignments = await assignmentService.getTaskAssignments(taskId, req.orgId!);

      res.status(200).json({
        data: assignments,
      });
    } catch (error) {
      next(error);
    }
  }
}
