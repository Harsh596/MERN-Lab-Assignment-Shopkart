import api from './api';

/**
 * Fetch current authenticated user's cart from GET /cart
 */
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

/**
 * Add a product to the cart (or increment if already added) via POST /cart/:productId
 */
export const addToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

/**
 * Update the quantity of a product in the cart via PATCH /cart/:productId
 * Body: { quantity: number }
 */
export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

/**
 * Remove a product from the cart via DELETE /cart/:productId
 */
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};
