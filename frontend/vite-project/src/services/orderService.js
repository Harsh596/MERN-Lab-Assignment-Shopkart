import api from './api';

/**
 * Task 4: Initiate ShopKart order and Razorpay Order on server
 * @param {Object} shippingAddress - { fullName, phone, addressLine1, city, state, pincode }
 */
export const createPaymentOrder = async (shippingAddress) => {
  const response = await api.post('/orders/create-payment-order', { shippingAddress });
  return response.data;
};

/**
 * Task 4 & Step 11: Verify Razorpay signature and confirm order
 * @param {Object} data - { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPayment = async (data) => {
  const response = await api.post('/orders/verify-payment', data);
  return response.data;
};

/**
 * Task 7: Fetch all orders placed by the current authenticated user
 */
export const getMyOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

/**
 * Fetch a single order by ID with ownership verification
 */
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

/**
 * Bonus Challenge (+10 Marks): Update order progress status
 */
export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};
