import mongoose from 'mongoose';
import ProductReview from '../models/productReview.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await ProductReview.find({ product: productId, isActive: true })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatar');

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, 'Product reviews retrieved successfully'));
});

export const checkReviewEligibility = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!req.user) {
    return res.status(200).json(new ApiResponse(200, { canReview: false, reason: 'login_required' }));
  }

  const hasDeliveredOrder = await Order.findOne({
    user: req.user._id,
    shippingStatus: 'delivered',
    'items.product': productId,
  });

  if (!hasDeliveredOrder) {
    return res.status(200).json(
      new ApiResponse(200, {
        canReview: false,
        reason: 'not_purchased',
        message: 'Only verified buyers who have had this product delivered can submit a review.',
      })
    );
  }

  const existingReview = await ProductReview.findOne({
    product: productId,
    user: req.user._id,
  });

  if (existingReview) {
    return res.status(200).json(
      new ApiResponse(200, {
        canReview: false,
        reason: 'already_reviewed',
        message: 'You have already submitted a review for this product.',
      })
    );
  }

  return res.status(200).json(new ApiResponse(200, { canReview: true }));
});

export const createProductReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, text, images, improvementReason } = req.body;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // 1. Verify user purchased the product and it is delivered
  const hasDeliveredOrder = await Order.findOne({
    user: req.user._id,
    shippingStatus: 'delivered',
    'items.product': productId,
  });

  if (!hasDeliveredOrder) {
    throw new ApiError(403, 'You can only review products you have purchased and had delivered.');
  }

  // 2. Check if user already submitted a review
  const existingReview = await ProductReview.findOne({
    product: productId,
    user: req.user._id,
  });

  if (existingReview) {
    throw new ApiError(400, 'You have already submitted a review for this product.');
  }

  // 3. Process image uploads to Cloudinary
  const uploadedImages = [];
  if (images && Array.isArray(images)) {
    for (const base64Str of images) {
      try {
        const result = await uploadToCloudinary(base64Str, 'reviews');
        uploadedImages.push({
          url: result.url,
          publicId: result.publicId,
        });
      } catch (uploadErr) {
        throw new ApiError(500, `Image upload failed: ${uploadErr.message}`);
      }
    }
  }

  // 4. Create review
  const review = await ProductReview.create({
    product: productId,
    user: req.user._id,
    userName: req.user.name,
    rating,
    text,
    images: uploadedImages,
    improvementReason: rating < 5 ? improvementReason : undefined,
  });

  // 5. Recalculate average rating and number of reviews
  const stats = await ProductReview.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    product.rating = stats[0].averageRating;
    product.numOfReviews = stats[0].numOfReviews;
  } else {
    product.rating = 0;
    product.numOfReviews = 0;
  }
  await product.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(201, review, 'Product review submitted successfully'));
});
