const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    sku: { type: String, required: true },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: [true, 'Please provide product name'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: [true, 'Please provide product description'] },
    brandId: { type: String, required: true },
    categoryId: { type: String, required: true },
    images: [imageSchema],
    variants: [variantSchema],
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and category filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('Product', productSchema);
