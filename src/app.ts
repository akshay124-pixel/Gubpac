import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import projectRoutes from './modules/projects/project.routes';
import taskRoutes from './modules/tasks/task.routes';
import assignmentRoutes from './modules/assignments/assignment.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import jobRoutes from './modules/jobs/job.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/', taskRoutes); // Task routes include /tasks and /projects/:projectId/tasks
app.use('/', assignmentRoutes); // Assignment routes include /tasks/:taskId/assignments
app.use('/dashboard', dashboardRoutes);
app.use('/jobs', jobRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not found',
    code: 'NOT_FOUND',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
