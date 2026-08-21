import { Router } from 'express';
import { JobController } from './job.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachOrgContext, verifyOrgMembership } from '../../middleware/authorize';
import { validateParams } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();
const jobController = new JobController();

const jobIdSchema = z.object({
  id: z.string().min(1, 'Job ID is required'),
});

// All job routes require authentication and organization context
router.use(authenticate);
router.use(attachOrgContext);
router.use(verifyOrgMembership);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get job status by ID
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
 *         description: Job status
 */
router.get(
  '/:id',
  validateParams(jobIdSchema),
  jobController.getJobStatus.bind(jobController)
);

export default router;
