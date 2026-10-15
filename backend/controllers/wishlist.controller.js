

const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');


const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Verify that the product actually exists in the Product collection
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Find customer document
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    // Ensure wishlist array is initialized
    if (!Array.isArray(customer.wishlist)) {
      customer.wishlist = [];
    }

    // 4. Duplicate prevention check
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // 5. Add product reference and persist
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist',
      error: error.message,
    });
  }
};

/**
 * Task 3: Get Current User's Wishlist
 * GET /wishlist
 */
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Retrieve customer document and populate Product references
    const customer = await Customer.findById(userId).populate({
      path: 'wishlist',
      select: 'name description price category image stock createdAt',
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    // Filter out null entries in case referenced products were deleted from DB
    const wishlistItems = (customer.wishlist || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: wishlistItems.length,
      wishlist: wishlistItems,
    });
  } catch (error) {
    console.error('Error in getWishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
      error: error.message,
    });
  }
};

/**
 * Task 4: Remove Product from Wishlist
 * DELETE /wishlist/:productId
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Find customer document
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (!Array.isArray(customer.wishlist)) {
      customer.wishlist = [];
    }

    // 3. Check if product is in wishlist
    const itemIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // 4. Remove reference and save
    customer.wishlist.splice(itemIndex, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Error in removeFromWishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist',
      error: error.message,
    });
  }
};

/**
 * Bonus Challenge 1: Wishlist Toggle
 * PATCH /wishlist/:productId/toggle
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Find customer document
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (!Array.isArray(customer.wishlist)) {
      customer.wishlist = [];
    }

    const itemIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex > -1) {
      // Product is currently saved -> remove it
      customer.wishlist.splice(itemIndex, 1);
      await customer.save();

      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
      });
    } else {
      // Product is not saved -> add it
      customer.wishlist.push(productId);
      await customer.save();

      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Product added to wishlist',
      });
    }
  } catch (error) {
    console.error('Error in toggleWishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while toggling wishlist',
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
