import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import errorHandler from './middlewares/error.middleware.js';
import router from './routes/index.js';
import logger from './config/logger.js';
import ApiError from './utils/ApiError.js';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS with dynamic settings
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or local tests)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Apply Global Rate Limiting
app.use(globalLimiter);

// Body parsers: Limit payload sizes to protect against DOS
// Capture raw body buffer for verification of webhooks signature (e.g. Razorpay)
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Sanitize query to prevent NoSQL query injection
app.use(mongoSanitize());

// Log HTTP requests through winston stream
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// Root endpoint
app.get(['/', '/api/v1'], (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is working' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/v1', router);

// Catch-all 404 Route handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found - ${req.originalUrl}`));
});

// Global Error Handler middleware
app.use(errorHandler);

export default app;
