import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState({});
  const [error, setError] = useState(null);

  const setItemActionLoading = (productId, isLoading) => {
    setItemLoading((prev) => ({ ...prev, [productId]: isLoading }));
  };

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      if (response.data?.success) {
        setCartItems(response.data.cart || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    setError(null);
    setItemActionLoading(productId, true);
    try {
      const response = await api.post(`/cart/${productId}`);
      if (response.data?.success) {
        setCartItems(response.data.cart || []);
        return { success: true, message: response.data?.message || 'Added to cart' };
      }
      return { success: false, message: response.data?.message || 'Failed to add item' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add item to cart',
      };
    } finally {
      setItemActionLoading(productId, false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    setError(null);
    setItemActionLoading(productId, true);
    try {
      const response = await api.patch(`/cart/${productId}`, { quantity: newQuantity });
      if (response.data?.success) {
        setCartItems(response.data.cart || []);
        return { success: true, message: response.data?.message || 'Quantity updated' };
      }
      return { success: false, message: response.data?.message || 'Failed to update quantity' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update quantity',
      };
    } finally {
      setItemActionLoading(productId, false);
    }
  };

  const removeFromCart = async (productId) => {
    setError(null);
    setItemActionLoading(productId, true);
    try {
      const response = await api.delete(`/cart/${productId}`);
      if (response.data?.success) {
        setCartItems(response.data.cart || []);
        return { success: true, message: response.data?.message || 'Item removed' };
      }
      return { success: false, message: response.data?.message || 'Failed to remove item' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to remove item',
      };
    } finally {
      setItemActionLoading(productId, false);
    }
  };

  const isItemInCart = useCallback(
    (productId) => {
      return cartItems.some((item) => (item.product?._id || item.product) === productId);
    },
    [cartItems]
  );

  const getItemQuantity = useCallback(
    (productId) => {
      const item = cartItems.find((i) => (i.product?._id || i.product) === productId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  const { totalUnits, subtotal } = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.product?.price) || 0;
        acc.totalUnits += qty;
        acc.subtotal += price * qty;
        return acc;
      },
      { totalUnits: 0, subtotal: 0 }
    );
  }, [cartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = {
    cartItems,
    loading,
    itemLoading,
    error,
    totalUnits,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    isItemInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;