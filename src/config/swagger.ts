import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: 'A lightweight project management system backend API',
      contact: {
        name: 'TaskFlow Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Projects',
        description: 'Project management endpoints',
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints',
      },
      {
        name: 'Assignments',
        description: 'Task assignment endpoints',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard and statistics endpoints',
      },
      {
        name: 'Jobs',
        description: 'Background job status endpoints',
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
