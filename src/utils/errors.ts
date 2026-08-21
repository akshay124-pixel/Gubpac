export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication Errors
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, 'UNAUTHORIZED', 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, 'FORBIDDEN', 403, details);
  }
}

// Resource Errors
export class NotFoundError extends AppError {
  constructor(resource: string, details?: unknown) {
    super(`${resource} not found`, `${resource.toUpperCase()}_NOT_FOUND`, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFLICT', 409, details);
  }
}

// Validation Errors
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

// Rate Limit Error
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details?: unknown) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details);
  }
}

// Internal Server Error
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, details);
  }
}
