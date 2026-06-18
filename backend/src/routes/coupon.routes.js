import express from 'express';
import { validateCouponCode } from '../controllers/coupon.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import couponValidation from '../validations/coupon.validation.js';

const router = express.Router();

// Allow authenticated users to validate a coupon code
router.post('/validate', verifyJWT, validate(couponValidation.validateCoupon), validateCouponCode);

export default router;
