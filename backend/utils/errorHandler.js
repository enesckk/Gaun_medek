/**
 * Centralized Error Handling Utility
 * Standardizes error responses across all controllers
 */

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error response formatter
 */
export const formatErrorResponse = (error, req) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default error response
  const response = {
    success: false,
    message: error.message || 'Internal server error',
  };

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  // Add error details for operational errors
  if (error.isOperational !== false) {
    response.error = {
      name: error.name || 'Error',
      code: error.code || 'INTERNAL_ERROR',
    };
  }

  // Add request info in development
  if (isDevelopment) {
    response.request = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
    };
  }

  return response;
};

/**
 * Error logging utility
 */
export const logError = (error, req, context = '') => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode || 500,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    context,
  };

  // Console log (can be replaced with proper logger)
  console.error('❌ ERROR:', JSON.stringify(logData, null, 2));
  
  // TODO: Integrate with Winston/Pino for production logging
  return logData;
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 * Must be used after all routes
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Log error
  logError(err, req);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Format error response
  const errorResponse = formatErrorResponse(err, req);

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

/**
 * Validation error handler
 */
export const validationErrorHandler = (errors, message = 'Validation failed') => {
  const error = new AppError(message, 400);
  error.validationErrors = errors;
  return error;
};

