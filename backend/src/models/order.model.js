import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  priceAtPurchase: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  costAtPurchase: {
    type: Number,
    required: true,
    min: [0, 'Cost price cannot be negative'],
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow guest checkouts if needed, but linked to users primarily
    },
    sessionId: {
      type: String,
      required: false, // Track session that created this order
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative'],
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay'],
      default: 'razorpay',
    },
    shippingStatus: {
      type: String,
      enum: ['pending', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'ready_for_pickup', 'picked_up'],
      default: 'pending',
    },
    shippingTrackingNumber: {
      type: String,
      default: '',
    },
    shippingHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'ready_for_pickup', 'picked_up'],
        },
        description: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    conversionSource: {
      type: String,
      default: 'direct', // e.g., 'google', 'newsletter_may', etc.
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    couponCode: {
      type: String,
      default: '',
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative'],
    },
    shippingAddress: {
      tag: { type: String, default: '' },
      doorNumber: { type: String, default: '' },
      secondLine: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    deliveryOption: {
      type: String,
      enum: ['delivery', 'instore_pickup'],
      default: 'delivery',
    },
    storeAddress: {
      type: String,
      default: '',
    },
    pickupSlot: {
      date: { type: Date },
      time: { type: String },
    },
    pickupVerificationPin: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

// Virtual for Profit Margin
orderSchema.virtual('profit').get(function () {
  return this.totalAmount - this.totalCost;
});

orderSchema.virtual('profitMarginPercentage').get(function () {
  if (this.totalAmount === 0) return 0;
  return ((this.totalAmount - this.totalCost) / this.totalAmount) * 100;
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
