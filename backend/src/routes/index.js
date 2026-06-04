import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import listingRoutes from './listing.routes.js';
import orderRoutes from './order.routes.js';
import analyticsRoutes from './analytics.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import contentRoutes from './content.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/listings', listingRoutes);
router.use('/orders', orderRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/content', contentRoutes);

export default router;
