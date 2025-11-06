import logger from '../config/logger.js';
import { Prisma } from '@prisma/client';

/**
 * Global Error Handler Middleware
 * Catches all errors and returns appropriate responses
 */

// 404 Not Found Handler
export function notFoundHandler(req, res, next) {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    path: req.originalUrl,
    method: req.method,
  });
}

// Global Error Handler
export function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    error: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.email || 'anonymous',
  });

  // Default error response
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errorType = 'ServerError';
  let details = undefined;

  // Handle specific error types
  
  // Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    errorType = 'DatabaseError';
    
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        statusCode = 409;
        message = 'A record with this information already exists';
        details = {
          field: err.meta?.target,
          constraint: 'unique',
        };
        break;
        
      case 'P2025':
        // Record not found
        statusCode = 404;
        message = 'Record not found';
        break;
        
      case 'P2003':
        // Foreign key constraint violation
        statusCode = 400;
        message = 'Referenced record does not exist';
        details = {
          field: err.meta?.field_name,
        };
        break;
        
      case 'P2014':
        // Required relation violation
        statusCode = 400;
        message = 'Required relation constraint violated';
        break;
        
      default:
        statusCode = 500;
        message = 'Database operation failed';
        details = process.env.NODE_ENV === 'development' ? { code: err.code } : undefined;
    }
  }
  
  // Prisma Validation Errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    errorType = 'ValidationError';
    statusCode = 400;
    message = 'Invalid data provided to database';
  }
  
  // Prisma Initialization Errors
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    errorType = 'DatabaseConnectionError';
    statusCode = 503;
    message = 'Database connection failed';
    logger.error('Database connection error', { error: err.message });
  }
  
  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    errorType = 'AuthenticationError';
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  
  else if (err.name === 'TokenExpiredError') {
    errorType = 'AuthenticationError';
    statusCode = 401;
    message = 'Authentication token has expired';
  }
  
  // Validation Errors
  else if (err.name === 'ValidationError') {
    errorType = 'ValidationError';
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors;
  }
  
  // Multer File Upload Errors
  else if (err.name === 'MulterError') {
    errorType = 'FileUploadError';
    statusCode = 400;
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size exceeds the maximum limit';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = 'File upload failed';
    }
  }
  
  // Syntax Errors (malformed JSON)
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    errorType = 'SyntaxError';
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }
  
  // CORS Errors
  else if (err.message === 'Not allowed by CORS') {
    errorType = 'CORSError';
    statusCode = 403;
    message = 'Access denied by CORS policy';
  }
  
  // Rate Limit Errors
  else if (err.status === 429) {
    errorType = 'RateLimitError';
    statusCode = 429;
    message = 'Too many requests, please try again later';
  }

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      type: errorType,
      message: message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        raw: err.message,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
}

// Async error wrapper to catch errors in async route handlers
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Validation error helper
export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
}

// Not found error helper
export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// Forbidden error helper
export class ForbiddenError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

// Unauthorized error helper
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

// Conflict error helper
export class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
};
