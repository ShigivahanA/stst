import express from 'express';
import {
  getAdminStats,
  getPendingListings,
  updateListingStatus,
  getBookings,
  getUsers,
  getUserDetail,
  updateUser,
  banUser,
  deleteUser,
  getAdminContent,
  createAdminContent,
  updateAdminContent,
  deleteAdminContent,
  uploadProductImage,
  deleteProductImage,
  getAdminContentStats,
  createAdminStat,
  updateAdminStat,
  deleteAdminStat,
  getAdminReviews,
  createAdminReview,
  updateAdminReview,
  deleteAdminReview,
  getAdminPage,
  addAdminSection,
  updateAdminSection,
  deleteAdminSection,
  reorderAdminSections,
} from '../controllers/admin.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Secure all admin routes with JWT verification and admin role checking
router.use(verifyJWT);
router.use(authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.get('/listings/pending', getPendingListings);
router.put('/listings/:id/status', updateListingStatus);
router.get('/bookings', getBookings);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.put('/users/:id/ban', banUser);
router.delete('/users/:id', deleteUser);

router.post('/products/upload-image', uploadProductImage);
router.post('/products/delete-image', deleteProductImage);

router.get('/content', getAdminContent);
router.post('/content', createAdminContent);
router.put('/content/:id', updateAdminContent);
router.delete('/content/:id', deleteAdminContent);

// Hero Stats routes
router.get('/hero-stats', getAdminContentStats);
router.post('/hero-stats', createAdminStat);
router.put('/hero-stats/:id', updateAdminStat);
router.delete('/hero-stats/:id', deleteAdminStat);

// Testimonial Reviews routes
router.get('/reviews', getAdminReviews);
router.post('/reviews', createAdminReview);
router.put('/reviews/:id', updateAdminReview);
router.delete('/reviews/:id', deleteAdminReview);

// Policy/Info Pages routes
router.get('/pages/:slug', getAdminPage);
router.post('/pages/:slug/sections', addAdminSection);
router.put('/pages/:slug/sections/:sectionId', updateAdminSection);
router.delete('/pages/:slug/sections/:sectionId', deleteAdminSection);
router.post('/pages/:slug/reorder', reorderAdminSections);

export default router;
