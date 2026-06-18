import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  updateDetails,
  addAddress,
  deleteAddress,
  changePassword,
  toggle2FA,
  updateAddress,
  uploadAvatar,
  deleteAvatar,
  toggleWishlist,
  getWishlist,
  updateConsents,
} from '../controllers/user.controller.js';

const router = express.Router();

// Enforce authentication on all profile routes
router.use(verifyJWT);

router.put('/updatedetails', updateDetails);
router.post('/address', addAddress);
router.put('/address/:addressId', updateAddress);
router.delete('/address/:addressId', deleteAddress);
router.put('/change-password', changePassword);
router.post('/toggle-2fa', toggle2FA);
router.put('/avatar', uploadAvatar);
router.delete('/avatar', deleteAvatar);
router.post('/wishlist/:productId', toggleWishlist);
router.get('/wishlist', getWishlist);
router.put('/consents', updateConsents);

export default router;
