import express from 'express';
import { getPublicContent, getPublicStats, getPublicReviews, getPublicPage, getPublicBadges } from '../controllers/content.controller.js';

const router = express.Router();

router.get('/', getPublicContent);
router.get('/stats', getPublicStats);
router.get('/reviews', getPublicReviews);
router.get('/page/:slug', getPublicPage);
router.get('/badges', getPublicBadges);

export default router;

