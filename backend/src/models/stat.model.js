import mongoose from 'mongoose';

const statSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: [true, 'Stat value is required'],
      trim: true,
    },
    label: {
      type: String,
      required: [true, 'Stat label is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
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

const Stat = mongoose.model('Stat', statSchema);
export default Stat;
