import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      required: [true, 'Icon is required'],
      trim: true,
      default: 'ShieldCheck',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
