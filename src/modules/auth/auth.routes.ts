import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from './auth.validation';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - organizationName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               organizationName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  authController.register.bind(authController)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  authController.login.bind(authController)
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post(
  '/refresh',
  authRateLimiter,
  validateBody(refreshSchema),
  authController.refresh.bind(authController)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post(
  '/logout',
  authRateLimiter,
  validateBody(logoutSchema),
  authController.logout.bind(authController)
);

export default router;
