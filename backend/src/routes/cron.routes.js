import express from 'express';
import { checkAbandonedCarts } from '../services/cartScheduler.service.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = express.Router();

// Cron endpoint for triggering abandoned cart check & checkout cleanup
router.post('/abandoned-cart', async (req, res, next) => {
  try {
    const cronSecret = process.env.CRON_SECRET || 'cron_secret_123';
    const requestSecret = req.headers['x-cron-secret'] || req.query.secret;

    if (requestSecret !== cronSecret) {
      throw new ApiError(401, 'Unauthorized cron trigger');
    }

    await checkAbandonedCarts();

    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, 'Abandoned cart and checkout cleanup executed successfully'));
  } catch (error) {
    next(error);
  }
});

export default router;
