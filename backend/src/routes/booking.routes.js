import express from 'express';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import * as bookingController from '../controllers/booking.controller.js';
import * as bookingValidation from '../validations/booking.validation.js';

const router = express.Router();

// Public route to submit an in-store demo booking
router.post(
  '/',
  validate(bookingValidation.createBooking),
  bookingController.createBooking
);

// Admin-only routes
router.use(verifyJWT, authorizeRoles('admin'));

router.get(
  '/',
  validate(bookingValidation.getBookings),
  bookingController.getBookings
);

router.put(
  '/:id/status',
  validate(bookingValidation.updateBookingStatus),
  bookingController.updateBookingStatus
);

router.delete(
  '/:id',
  validate(bookingValidation.deleteBooking),
  bookingController.deleteBooking
);

export default router;
