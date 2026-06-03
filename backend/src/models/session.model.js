import mongoose from 'mongoose';

const pageVisitSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
  durationSeconds: {
    type: Number,
    default: 0,
  },
});

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
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
    deviceType: {
      type: String,
      default: 'desktop',
    },
    pagesVisited: [pageVisitSchema],
    durationSeconds: {
      type: Number,
      default: 0,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    conversionRecorded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Update session total duration based on page visits
sessionSchema.methods.calculateTotalDuration = function () {
  this.durationSeconds = this.pagesVisited.reduce((total, page) => total + page.durationSeconds, 0);
  this.lastActiveAt = new Date();
  return this.durationSeconds;
};

const Session = mongoose.model('Session', sessionSchema);
export default Session;
