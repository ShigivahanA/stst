import express from 'express';
import { checkout, verifyPayment, webhook, getHistory, getOrderDetail } from '../controllers/order.controller.js';
import { verifyJWT, restrictAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import orderValidation from '../validations/order.validation.js';

const router = express.Router();

router.post('/checkout', verifyJWT, restrictAdmin, validate(orderValidation.checkout), checkout);
router.post('/verify-payment', verifyJWT, restrictAdmin, verifyPayment);
router.get('/history', verifyJWT, restrictAdmin, getHistory);
router.get('/:id', verifyJWT, getOrderDetail);
router.post('/webhook', webhook);

export default router;
