import { Router } from 'express';
import { ProjectController } from './project.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachOrgContext, verifyOrgMembership, requireOrgAdmin } from '../../middleware/authorize';
import { validateBody, validateParams } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema, projectIdSchema } from './project.validation';

const router = Router();
const projectController = new ProjectController();

// All project routes require authentication and organization context
router.use(authenticate);
router.use(attachOrgContext);
router.use(verifyOrgMembership);

/**
 * @swagger
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post(
  '/',
  validateBody(createProjectSchema),
  projectController.create.bind(projectController)
);

/**
 * @swagger
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects in organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-organization-id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/', projectController.getAll.bind(projectController));

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
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
 *         description: Project details
 */
router.get(
  '/:id',
  validateParams(projectIdSchema),
  projectController.getById.bind(projectController)
);

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update project
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 */
router.patch(
  '/:id',
  validateParams(projectIdSchema),
  validateBody(updateProjectSchema),
  projectController.update.bind(projectController)
);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project (requires org_admin)
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
 *         description: Project deleted successfully
 */
router.delete(
  '/:id',
  validateParams(projectIdSchema),
  requireOrgAdmin,
  projectController.delete.bind(projectController)
);

export default router;
