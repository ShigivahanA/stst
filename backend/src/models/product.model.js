import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    desc: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: [0, 'MRP cannot be negative'],
      default: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
      default: 0,
    },
    tax: {
      type: Number,
      required: [true, 'Tax percentage is required'],
      min: [0, 'Tax percentage cannot be negative'],
      default: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    lowstockthreshold: {
      type: Number,
      default: 10,
      min: [0, 'Threshold cannot be negative'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        url: {
          type: String,
          required: [true, 'Image URL is required'],
        },
        publicId: {
          type: String,
          required: [true, 'Image public ID is required'],
        },
      },
    ],
    specifications: [
      {
        type: {
          type: String,
          enum: ['key_value', 'title_para', 'image', 'video', 'custom'],
          required: [true, 'Specification type is required'],
        },
        label: {
          type: String,
          trim: true,
        },
        value: {
          type: String,
          trim: true,
        },
        extra: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, active: 1 });
productSchema.index({ featured: 1, active: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
