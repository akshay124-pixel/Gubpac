import { Router } from 'express';
import { TaskController } from './task.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachOrgContext, verifyOrgMembership } from '../../middleware/authorize';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  projectIdSchema,
  taskQuerySchema,
} from './task.validation';

const router = Router();
const taskController = new TaskController();

// All task routes require authentication and organization context
router.use(authenticate);
router.use(attachOrgContext);
router.use(verifyOrgMembership);

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task in a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
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
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, review, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post(
  '/projects/:projectId/tasks',
  validateParams(projectIdSchema),
  validateBody(createTaskSchema),
  taskController.create.bind(taskController)
);

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, review, done]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: dueFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dueTo
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get(
  '/tasks',
  validateQuery(taskQuerySchema),
  taskController.getAll.bind(taskController)
);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 */
router.get(
  '/tasks/:id',
  validateParams(taskIdSchema),
  taskController.getById.bind(taskController)
);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, review, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.patch(
  '/tasks/:id',
  validateParams(taskIdSchema),
  validateBody(updateTaskSchema),
  taskController.update.bind(taskController)
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */
router.delete(
  '/tasks/:id',
  validateParams(taskIdSchema),
  taskController.delete.bind(taskController)
);

export default router;
