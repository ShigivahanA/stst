import express from 'express';
import { initSession, sendHeartbeat, logEvent, getDashboard } from '../controllers/analytics.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import analyticsValidation from '../validations/analytics.validation.js';

const router = express.Router();

router.post('/session', initSession);
router.post('/heartbeat', validate(analyticsValidation.heartbeat), sendHeartbeat);
router.post('/event', validate(analyticsValidation.trackEvent), logEvent);

// Admin-only metrics dashboard
router.get('/dashboard', verifyJWT, authorizeRoles('admin'), getDashboard);

export default router;
