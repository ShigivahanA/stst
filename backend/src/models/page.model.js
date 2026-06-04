import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const pageSchema = new mongoose.Schema(
  {
    pageSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      enum: ['privacy', 'shipping', 'terms', 'returns', 'faq'],
    },
    pageTitle: { type: String, required: true, trim: true },
    sections: [sectionSchema],
  },
  { timestamps: true }
);

const Page = mongoose.model('Page', pageSchema);
export default Page;
