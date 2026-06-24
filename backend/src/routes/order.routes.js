import express from 'express';
import { checkout, verifyPayment, webhook, getHistory, getOrderDetail, checkChennaiLocation, savePickupSlot, verifyPickupCode, sendManualPickupEmail } from '../controllers/order.controller.js';
import { verifyJWT, restrictAdmin, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import orderValidation from '../validations/order.validation.js';

const router = express.Router();

router.post('/checkout', verifyJWT, restrictAdmin, validate(orderValidation.checkout), checkout);
router.post('/check-chennai', verifyJWT, restrictAdmin, checkChennaiLocation);
router.post('/verify-payment', verifyJWT, restrictAdmin, verifyPayment);
router.get('/history', verifyJWT, restrictAdmin, getHistory);
router.post('/:id/pickup-slot', verifyJWT, savePickupSlot);
router.post('/:id/verify-pickup', verifyJWT, authorizeRoles('admin'), verifyPickupCode);
router.post('/:id/send-pickup-email', verifyJWT, authorizeRoles('admin'), sendManualPickupEmail);
router.get('/:id', verifyJWT, getOrderDetail);
router.post('/webhook', webhook);

export default router;
