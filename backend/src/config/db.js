import mongoose from 'mongoose';
import logger from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

let cachedPromise = null;

const connectDB = async () => {
  // If we already have a connection established, reuse it
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection is already in progress, wait for it
  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecom';
  
  // Set connection options for reliability on serverless
  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
    socketTimeoutMS: 45000,
  };

  cachedPromise = mongoose.connect(mongoURI, options).then((conn) => {
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    cachedPromise = null;
    return conn.connection;
  }).catch((error) => {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    cachedPromise = null;
    // Don't crash the serverless container on a single connection failure
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  });

  return cachedPromise;
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

export default connectDB;
