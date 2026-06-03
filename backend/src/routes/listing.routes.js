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

const router = express.Router();

router.get('/', getListings);
router.get('/categories', getListingCategories);
router.get('/stats', getListingStats);
router.get('/reviews/landing', getLandingReviews);
router.get('/:id', getListing);

router.post('/', verifyJWT, createListing);
router.put('/:id', verifyJWT, updateListing);
router.delete('/:id', verifyJWT, deleteListing);

export default router;
