import { Request } from 'express';
import { OrgRole } from '@prisma/client';

export interface AuthUser {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  orgId?: string;
  orgRole?: OrgRole;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueFrom?: string;
  dueTo?: string;
}

export interface EmailJobPayload {
  to: string;
  subject: string;
  body: string;
  taskId: string;
  assignedBy: string;
}
