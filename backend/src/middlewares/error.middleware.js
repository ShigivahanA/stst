import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, err.errors || [], err.stack);
  }

  // Log error
  logger.error(
    `${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  if (error.statusCode === 500) {
    logger.error(error.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
