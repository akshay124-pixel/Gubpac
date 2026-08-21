import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { TaskService } from './task.service';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from './task.validation';

const taskService = new TaskService();

export class TaskController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const data = req.body as CreateTaskInput;
      const task = await taskService.create(projectId, data, req.orgId!);

      res.status(201).json({
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as TaskQueryInput;
      const result = await taskService.getAll(req.orgId!, query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.getById(id, req.orgId!);

      res.status(200).json({
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateTaskInput;
      const task = await taskService.update(id, req.orgId!, data);

      res.status(200).json({
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await taskService.delete(id, req.orgId!);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
