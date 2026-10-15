const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');



const populateCart = async (userId) => {
  const customer = await Customer.findById(userId).populate({
    path: 'cart.product',
    select: 'name price image stock category description',
  });
  return customer ? customer.cart.filter((item) => item.product != null) : [];
};

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    customer.cart = customer.cart || [];

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Product out of stock' });
    }

    const existingItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      if (customer.cart[existingItemIndex].quantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add more than available stock',
        });
      }
      customer.cart[existingItemIndex].quantity += 1;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();
    const cart = await populateCart(req.user._id);
    return res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await populateCart(req.user._id);
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get cart' });
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    customer.cart = customer.cart || [];

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Quantity exceeds stock' });
    }

    const existingItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );
    if (existingItemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    customer.cart[existingItemIndex].quantity = quantity;

    await customer.save();
    const cart = await populateCart(req.user._id);
    return res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    customer.cart = customer.cart || [];

    const initialLength = customer.cart.length;
    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    if (customer.cart.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    await customer.save();
    const cart = await populateCart(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove from cart' });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
};

