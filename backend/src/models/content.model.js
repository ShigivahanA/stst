import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Content type is required'],
      enum: ['maker', 'story', 'press'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model('Content', contentSchema);
export default Content;
