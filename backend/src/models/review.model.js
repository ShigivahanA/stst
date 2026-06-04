import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
    },
    userName: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true,
    },
    userRole: {
      type: String,
      trim: true,
      default: 'Verified Customer',
    },
    userLocation: {
      type: String,
      trim: true,
      default: 'Tamil Nadu',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
