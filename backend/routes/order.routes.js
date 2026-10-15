const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { protectCustomer } = require('../middlewares/auth.middleware');

// Protect all order endpoints with customer JWT authentication
router.use(protectCustomer);

// Task 4: Create Order & Razorpay payment order
router.post('/create-payment-order', createPaymentOrder);

// Task 4 & Step 11: Verify Razorpay signature and place order
router.post('/verify-payment', verifyPayment);

// Task 7: Retrieve all orders for logged-in user
router.get('/', getMyOrders);

// Single order details with ownership verification
router.get('/:id', getOrderById);

// Bonus Challenge (+10 Marks): Update order progression status
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
