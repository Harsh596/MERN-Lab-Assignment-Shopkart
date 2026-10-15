const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      // Custom validator ensuring price is strictly greater than 0
      validate: {
        validator: function (value) {
          return typeof value === 'number' && value > 0;
        },
        message: 'Price must be greater than 0',
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Product stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be an integer count of items',
      },
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1 });
productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
