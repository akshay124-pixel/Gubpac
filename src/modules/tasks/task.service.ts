import { prisma } from '../../database/prisma';
import { verifyProjectAccess, verifyTaskAccess } from '../../middleware/authorize';
import { calculatePagination, createPaginationResult } from '../../utils/pagination';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from './task.validation';
import { Prisma } from '@prisma/client';

export class TaskService {
  /**
   * Create a new task within a project
   */
  async create(projectId: string, data: CreateTaskInput, orgId: string) {
    // Verify project belongs to organization
    await verifyProjectAccess(projectId, orgId);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            orgId: true,
          },
        },
      },
    });

    return task;
  }

  /**
   * Get all tasks with filtering and pagination
   */
  async getAll(orgId: string, query: TaskQueryInput) {
    const { skip, take, page, limit } = calculatePagination(
      parseInt(query.page as unknown as string, 10),
      parseInt(query.limit as unknown as string, 10)
    );

    // Build where clause with organization scope
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      project: {
        orgId,
        deletedAt: null,
      },
    };

    // Apply filters
    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.assigneeId) {
      where.assignments = {
        some: {
          userId: query.assigneeId,
        },
      };
    }

    if (query.dueFrom || query.dueTo) {
      where.dueDate = {};
      if (query.dueFrom) {
        where.dueDate.gte = new Date(query.dueFrom);
      }
      if (query.dueTo) {
        where.dueDate.lte = new Date(query.dueTo);
      }
    }

    // Get total count
    const total = await prisma.task.count({ where });

    // Get tasks
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return createPaginationResult(tasks, total, { page, limit });
  }

  /**
   * Get a single task by ID
   */
  async getById(taskId: string, orgId: string) {
    await verifyTaskAccess(taskId, orgId);

    const fullTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            orgId: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return fullTask;
  }

  /**
   * Update a task
   */
  async update(taskId: string, orgId: string, data: UpdateTaskInput) {
    // Verify task belongs to organization
    await verifyTaskAccess(taskId, orgId);

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return task;
  }

  /**
   * Delete a task (soft delete)
   */
  async delete(taskId: string, orgId: string) {
    // Verify task belongs to organization
    await verifyTaskAccess(taskId, orgId);

    await prisma.task.update({
      where: { id: taskId },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Task deleted successfully' };
  }
}
