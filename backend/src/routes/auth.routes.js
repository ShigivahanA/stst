import express from 'express';
import { 
  register, 
  login, 
  logout, 
  refresh, 
  getMe, 
  forgotPassword, 
  resetPassword,
  addToCart,
  getCart,
  clearCart,
  verify2FA
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import authValidation from '../validations/auth.validation.js';

const router = express.Router();

router.post('/register', authLimiter, validate(authValidation.register), register);
router.post('/login', authLimiter, validate(authValidation.login), login);
router.post('/verify2fa', verify2FA);
router.post('/logout', logout);
router.post('/refresh-token', refresh);
router.get('/me', verifyJWT, getMe);

// Password Restores
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

// Persistence Carts
router.post('/cart', verifyJWT, addToCart);
router.get('/cart', verifyJWT, getCart);
router.delete('/cart', verifyJWT, clearCart);

export default router;
