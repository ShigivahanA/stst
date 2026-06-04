import express from 'express';
import { initSession, sendHeartbeat, logEvent, getDashboard } from '../controllers/analytics.controller.js';
import { verifyJWT, authorizeRoles, verifyOptionalJWT } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import analyticsValidation from '../validations/analytics.validation.js';

const router = express.Router();

router.post('/session', verifyOptionalJWT, initSession);
router.post('/heartbeat', verifyOptionalJWT, validate(analyticsValidation.heartbeat), sendHeartbeat);
router.post('/event', verifyOptionalJWT, validate(analyticsValidation.trackEvent), logEvent);

// Admin-only metrics dashboard
router.get('/dashboard', verifyJWT, authorizeRoles('admin'), getDashboard);

export default router;
