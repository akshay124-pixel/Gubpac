import { z } from 'zod';

export const assignUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
});

export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type AssignUserInput = z.infer<typeof assignUserSchema>;
