import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachOrgContext, verifyOrgMembership } from '../../middleware/authorize';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require authentication and organization context
router.use(authenticate);
router.use(attachOrgContext);
router.use(verifyOrgMembership);

/**
 * @swagger
 * /dashboard/tasks/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get task counts by status
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
 *         description: Task statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todo:
 *                   type: integer
 *                 in_progress:
 *                   type: integer
 *                 review:
 *                   type: integer
 *                 done:
 *                   type: integer
 */
router.get('/tasks/stats', dashboardController.getTaskStats.bind(dashboardController));

export default router;
