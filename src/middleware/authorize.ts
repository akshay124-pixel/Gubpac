import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { prisma } from '../database/prisma';
import { OrgRole } from '@prisma/client';

/**
 * Middleware to attach organization context to the request
 * Verifies that the authenticated user is a member of the specified organization
 */
export function attachOrgContext(req: AuthRequest, _res: Response, next: NextFunction) {
  const orgIdFromHeader = req.headers['x-organization-id'] as string;

  if (!orgIdFromHeader) {
    return next(new ForbiddenError('Organization ID is required'));
  }

  req.orgId = orgIdFromHeader;
  next();
}

/**
 * Middleware to verify organization membership
 * Must be used after attachOrgContext
 */
export async function verifyOrgMembership(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || !req.orgId) {
      return next(new ForbiddenError('Authentication and organization context required'));
    }

    const membership = await prisma.orgMember.findUnique({
      where: {
        userId_orgId: {
          userId: req.user.userId,
          orgId: req.orgId,
        },
      },
    });

    if (!membership) {
      return next(new ForbiddenError('You are not a member of this organization'));
    }

    req.orgRole = membership.role;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to require org_admin role
 */
export function requireOrgAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.orgRole) {
    return next(new ForbiddenError('Organization role not found'));
  }

  if (req.orgRole !== OrgRole.org_admin) {
    return next(new ForbiddenError('This action requires organization admin privileges'));
  }

  next();
}

/**
 * Helper to verify a project belongs to the user's organization
 */
export async function verifyProjectAccess(projectId: string, orgId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      orgId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new NotFoundError('Project');
  }

  return project;
}

/**
 * Helper to verify a task belongs to the user's organization
 */
export async function verifyTaskAccess(taskId: string, orgId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      deletedAt: null,
      project: {
        orgId,
        deletedAt: null,
      },
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new NotFoundError('Task');
  }

  return task;
}
