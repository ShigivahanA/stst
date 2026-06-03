import express from 'express';
import { checkout, verifyPayment, webhook, getHistory } from '../controllers/order.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import orderValidation from '../validations/order.validation.js';

const router = express.Router();

router.post('/checkout', verifyJWT, validate(orderValidation.checkout), checkout);
router.post('/verify-payment', verifyJWT, verifyPayment);
router.get('/history', verifyJWT, getHistory);
router.post('/webhook', webhook);

export default router;
