import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';
import logger from './config/logger.js';
import { startCartScheduler } from './services/cartScheduler.service.js';

// Load environment variables configuration
dotenv.config();

const PORT = process.env.PORT || 8000;

// Handle uncaught exceptions globally
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! Shutting down... ${err.name}: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

let server;

// Connect to MongoDB first, then start server
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      // Start background cart scheduler
      startCartScheduler();
    });
  })
  .catch((err) => {
    logger.error(`Failed to start database: ${err.message}`);
    process.exit(1);
  });

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION! Shutting down... ${err.name}: ${err.message}`);
  logger.error(err.stack);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle signal termination events
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      logger.info('Process terminated.');
    });
  }
});
