import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { ProjectService } from './project.service';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';

const projectService = new ProjectService();

export class ProjectController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateProjectInput;
      const project = await projectService.create(data, req.orgId!, req.user!.userId);

      res.status(201).json({
        message: 'Project created successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.getAll(req.orgId!);

      res.status(200).json({
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await projectService.getById(id, req.orgId!);

      res.status(200).json({
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateProjectInput;
      const project = await projectService.update(id, req.orgId!, data);

      res.status(200).json({
        message: 'Project updated successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await projectService.delete(id, req.orgId!);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
