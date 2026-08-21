import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const taskIdSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

export const projectIdSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

export const taskQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().uuid().optional(),
  dueFrom: z.string().datetime().optional(),
  dueTo: z.string().datetime().optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
