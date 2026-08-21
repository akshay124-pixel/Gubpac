import { Router } from 'express';
import { AssignmentController } from './assignment.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachOrgContext, verifyOrgMembership } from '../../middleware/authorize';
import { validateBody, validateParams } from '../../middleware/validate';
import {
  assignUserSchema,
  taskIdParamSchema,
  userIdParamSchema,
} from './assignment.validation';

const router = Router();
const assignmentController = new AssignmentController();

// All assignment routes require authentication and organization context
router.use(authenticate);
router.use(attachOrgContext);
router.use(verifyOrgMembership);

/**
 * @swagger
 * /tasks/{taskId}/assignments:
 *   post:
 *     tags: [Assignments]
 *     summary: Assign a user to a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User assigned successfully
 */
router.post(
  '/tasks/:taskId/assignments',
  validateParams(taskIdParamSchema),
  validateBody(assignUserSchema),
  assignmentController.assignUser.bind(assignmentController)
);

/**
 * @swagger
 * /tasks/{taskId}/assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: Get all assignments for a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assignments
 */
router.get(
  '/tasks/:taskId/assignments',
  validateParams(taskIdParamSchema),
  assignmentController.getTaskAssignments.bind(assignmentController)
);

/**
 * @swagger
 * /tasks/{taskId}/assignments/{userId}:
 *   delete:
 *     tags: [Assignments]
 *     summary: Unassign a user from a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unassigned successfully
 */
router.delete(
  '/tasks/:taskId/assignments/:userId',
  validateParams(taskIdParamSchema),
  validateParams(userIdParamSchema),
  assignmentController.unassignUser.bind(assignmentController)
);

export default router;
