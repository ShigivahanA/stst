import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getStockEvaluation,
} from '../controllers/product.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import productValidation from '../validations/product.validation.js';

const router = express.Router();

// Public Routes
router.get('/', getProducts);
router.get('/:id', validate(productValidation.getProduct), getProduct);

// Admin Routes (Inventory management & Evaluation)
router.get(
  '/stock/evaluation',
  verifyJWT,
  authorizeRoles('admin'),
  getStockEvaluation
);

router.post(
  '/',
  verifyJWT,
  authorizeRoles('admin'),
  validate(productValidation.createProduct),
  createProduct
);

router.put(
  '/:id',
  verifyJWT,
  authorizeRoles('admin'),
  validate(productValidation.updateProduct),
  updateProduct
);

router.delete(
  '/:id',
  verifyJWT,
  authorizeRoles('admin'),
  validate(productValidation.getProduct),
  deleteProduct
);

export default router;
