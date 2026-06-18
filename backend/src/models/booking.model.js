import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
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
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: {
      type: String,
      trim: true,
      default: 'General Trial'
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'confirmed', 'completed', 'cancelled']
    },
    demoType: {
      type: String,
      enum: ['in-store', 'virtual'],
      default: 'in-store'
    },
    videoLink: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

bookingSchema.index({ email: 1 });
bookingSchema.index({ date: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
