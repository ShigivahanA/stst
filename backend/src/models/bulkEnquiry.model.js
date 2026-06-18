import mongoose from 'mongoose';

const bulkEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    requirements: {
      type: String,
      required: true,
      trim: true
    },
    budget: {
      type: String,
      trim: true
    },
    timeline: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'contacted', 'resolved', 'cancelled']
    }
  },
  { timestamps: true }
);

const BulkEnquiry = mongoose.model('BulkEnquiry', bulkEnquirySchema);
export default BulkEnquiry;
