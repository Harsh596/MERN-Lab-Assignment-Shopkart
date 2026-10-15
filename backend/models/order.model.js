const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: [true, 'Item name snapshot is required'],
        },
        price: {
          type: Number,
          required: [true, 'Item purchase price snapshot is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Item quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        image: {
          type: String,
        },
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: [1, 'Total amount must be greater than 0'],
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },

    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'],
      default: 'PENDING_PAYMENT',
    },

    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
