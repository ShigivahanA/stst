import express from 'express';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import * as bulkEnquiryController from '../controllers/bulkEnquiry.controller.js';
import * as bulkEnquiryValidation from '../validations/bulkEnquiry.validation.js';

const router = express.Router();

// Public route to submit an enquiry
router.post(
  '/',
  validate(bulkEnquiryValidation.createBulkEnquiry),
  bulkEnquiryController.createBulkEnquiry
);

// Admin-only routes
router.use(verifyJWT, authorizeRoles('admin'));

router.get(
  '/',
  validate(bulkEnquiryValidation.getBulkEnquiries),
  bulkEnquiryController.getBulkEnquiries
);

router.put(
  '/:id/status',
  validate(bulkEnquiryValidation.updateBulkEnquiryStatus),
  bulkEnquiryController.updateBulkEnquiryStatus
);

router.delete(
  '/:id',
  validate(bulkEnquiryValidation.deleteBulkEnquiry),
  bulkEnquiryController.deleteBulkEnquiry
);

export default router;
