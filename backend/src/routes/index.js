import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import listingRoutes from './listing.routes.js';
import orderRoutes from './order.routes.js';
import analyticsRoutes from './analytics.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/listings', listingRoutes);
router.use('/orders', orderRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
