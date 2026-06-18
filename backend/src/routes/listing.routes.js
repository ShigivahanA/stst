import express from 'express';
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getListingCategories,
  getListingStats,
  getLandingReviews
} from '../controllers/listing.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  getProductReviews,
  checkReviewEligibility,
  createProductReview
} from '../controllers/productReview.controller.js';
import productReviewValidation from '../validations/productReview.validation.js';

const router = express.Router();

router.get('/', getListings);
router.get('/categories', getListingCategories);
router.get('/stats', getListingStats);
router.get('/reviews/landing', getLandingReviews);

// Product Reviews alias under listings
router.get('/:productId/reviews', getProductReviews);
router.get('/:productId/can-review', verifyJWT, checkReviewEligibility);
router.post(
  '/:productId/reviews',
  verifyJWT,
  validate(productReviewValidation.createReview),
  createProductReview
);

router.get('/:id', getListing);

router.post('/', verifyJWT, createListing);
router.put('/:id', verifyJWT, updateListing);
router.delete('/:id', verifyJWT, deleteListing);

export default router;
