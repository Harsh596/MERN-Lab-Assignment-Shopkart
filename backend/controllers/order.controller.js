const mongoose = require('mongoose');
const crypto = require('crypto');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const razorpay = require('../config/razorpay');

/**
 * Task 4: Create Order API
 * POST /orders/create-payment-order
 * 
 * Validates shipping address, validates cart & live stock, calculates server-side total,
 * creates pending ShopKart order, generates Razorpay order in paise, and returns checkout info.
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address fields
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required and cannot be empty',
      });
    }

    // Validate phone (10-14 digits, optional + prefix)
    const phoneClean = phone.trim();
    if (!/^\+?[0-9]{10,14}$/.test(phoneClean)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be between 10 and 14 digits',
      });
    }

    // Validate pincode (6 digits)
    const pincodeClean = pincode.trim();
    if (!/^[0-9]{6}$/.test(pincodeClean)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must be exactly 6 numeric digits',
      });
    }

    // 2. Load authenticated customer's cart
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add products before checking out.',
      });
    }

    // 3. Load latest product data from MongoDB & verify stock
    const orderItems = [];
    let serverCalculatedTotal = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart are no longer available',
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${cartItem.quantity}.`,
        });
      }

      const itemPrice = Number(product.price) || 0;
      const itemQuantity = Number(cartItem.quantity) || 1;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: itemQuantity,
        image: product.image,
      });

      serverCalculatedTotal += itemPrice * itemQuantity;
    }

    if (serverCalculatedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Order total calculation resulted in invalid amount',
      });
    }

    // 4. Create Pending ShopKart Order
    const shopKartOrder = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phoneClean,
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincodeClean,
      },
      totalAmount: serverCalculatedTotal,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    // 5. Create Razorpay Order in Paise (₹1 = 100 paise)
    const amountInPaise = Math.round(serverCalculatedTotal * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: shopKartOrder._id.toString(),
      notes: {
        userId: req.user._id.toString(),
        orderId: shopKartOrder._id.toString(),
      },
    });

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    return res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment order',
    });
  }
};

/**
 * Task 4 & Step 12: Verify Razorpay Payment Signature
 * POST /orders/verify-payment
 * 
 * Verifies HMAC SHA-256 signature using RAZORPAY_KEY_SECRET.
 * If valid: marks order PAID & PLACED, decrements inventory stock, and clears the user's cart.
 */
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification details',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized order verification' });
    }

    // Verify signature using the order's stored razorpayOrderId from DB
    const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Signature verified successfully!
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Decrement stock for purchased products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Task 5: Clear user's cart in MongoDB after verified payment
    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
    });
  }
};

/**
 * Task 7: Get All Orders for Current User
 * GET /orders
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
    });
  }
};

/**
 * Single Order API
 * GET /orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Strict ownership enforcement
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details',
    });
  }
};

/**
 * Bonus Challenge (+10 Marks): Update Order Status
 * PATCH /orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
