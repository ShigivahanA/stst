import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    eventName: {
      type: String,
      required: true,
      enum: ['page_view', 'add_to_cart', 'initiate_checkout', 'conversion_purchase'],
      index: true,
    },
    properties: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    referrer: {
      type: String,
      default: 'direct',
    },
    utmSource: {
      type: String,
      default: '',
    },
    utmMedium: {
      type: String,
      default: '',
    },
    utmCampaign: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

analyticsEventSchema.index({ user: 1 });
analyticsEventSchema.index({ eventName: 1, timestamp: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
export default AnalyticsEvent;
