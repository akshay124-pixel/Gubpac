import { prisma } from '../../database/prisma';
import { verifyTaskAccess } from '../../middleware/authorize';
import { ConflictError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { AssignUserInput } from './assignment.validation';

export class AssignmentService {
  /**
   * Assign a user to a task
   * Uses transactional outbox pattern to ensure consistency between assignment and notification
   */
  async assignUser(taskId: string, data: AssignUserInput, orgId: string, assignedBy: string) {
    // Verify task belongs to organization
    const task = await verifyTaskAccess(taskId, orgId);

    // Verify user exists and belongs to the same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: data.userId,
        orgMemberships: {
          some: {
            orgId,
          },
        },
      },
      include: {
        orgMemberships: {
          where: {
            orgId,
          },
        },
      },
    });

    if (!targetUser) {
      throw new NotFoundError('User');
    }

    if (targetUser.orgMemberships.length === 0) {
      throw new ForbiddenError('User does not belong to this organization');
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.taskAssignment.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: data.userId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictError('User is already assigned to this task');
    }

    // Create assignment and outbox event in a transaction
    // This ensures consistency: either both are created or neither is created
    const result = await prisma.$transaction(async (tx) => {
      // Create task assignment
      const assignment = await tx.taskAssignment.create({
        data: {
          taskId,
          userId: data.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
      });

      // Create outbox event for email notification
      await tx.outboxEvent.create({
        data: {
          eventType: 'task.assigned',
          payload: JSON.stringify({
            taskId,
            userId: data.userId,
            userEmail: targetUser.email,
            taskTitle: task.title,
            assignedBy,
          }),
        },
      });

      return assignment;
    });

    return result;
  }

  /**
   * Unassign a user from a task
   */
  async unassignUser(taskId: string, userId: string, orgId: string) {
    // Verify task belongs to organization
    await verifyTaskAccess(taskId, orgId);

    // Find and delete the assignment
    const assignment = await prisma.taskAssignment.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment');
    }

    await prisma.taskAssignment.delete({
      where: {
        id: assignment.id,
      },
    });

    return { message: 'User unassigned successfully' };
  }

  /**
   * Get all assignments for a task
   */
  async getTaskAssignments(taskId: string, orgId: string) {
    // Verify task belongs to organization
    await verifyTaskAccess(taskId, orgId);

    const assignments = await prisma.taskAssignment.findMany({
      where: { taskId },
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
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return assignments;
  }
}
