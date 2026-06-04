import express from 'express';
import { getPublicContent, getPublicStats, getPublicReviews, getPublicPage } from '../controllers/content.controller.js';

const router = express.Router();

router.get('/', getPublicContent);
router.get('/stats', getPublicStats);
router.get('/reviews', getPublicReviews);
router.get('/page/:slug', getPublicPage);

export default router;
