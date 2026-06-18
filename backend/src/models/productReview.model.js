import mongoose from 'mongoose';

const productReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    userName: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
      maxlength: [500, 'Review text cannot exceed 500 characters'],
      trim: true,
    },
    images: [
      {
        url: {
          type: String,
          required: [true, 'Image URL is required'],
        },
        publicId: {
          type: String,
          required: [true, 'Image public ID is required'],
        },
      },
    ],
    improvementReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Improvement suggestion cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only review a product once
productReviewSchema.index({ product: 1, user: 1 }, { unique: true });

const ProductReview = mongoose.model('ProductReview', productReviewSchema);
export default ProductReview;
