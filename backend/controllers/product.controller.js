

const mongoose = require('mongoose');
const Product = require('../models/product.model');


const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // 1. Explicit validation of required fields
    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, category, image, and stock are mandatory.',
      });
    }

    // 2. Explicit validation for numeric types and business constraints
    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price. Price must be a positive number greater than 0.',
      });
    }

    if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock. Stock must be a non-negative integer (>= 0).',
      });
    }

    // 3. Create and save product document in MongoDB
    const newProduct = new Product({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numericStock,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct,
    });
  } catch (error) {
    // Check if error is a Mongoose schema validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating product',
      error: error.message,
    });
  }
};


const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build dynamic query filter object
    const filter = {};

    // 1. Search filter: case-insensitive regular expression matching `name`
    if (search && typeof search === 'string' && search.trim() !== '') {
      // Escape special regex characters to prevent regex injection attacks
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: sanitizedSearch, $options: 'i' };
    }

    // 2. Category filter: case-insensitive matching for robust user experience
    if (category && typeof category === 'string' && category.trim() !== '' && category.toLowerCase() !== 'all') {
      const sanitizedCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.category = { $regex: new RegExp(`^${sanitizedCategory}$`, 'i') };
    }

    // 3. Sorting logic (Bonus Challenge +10 Marks)
    let sortOptions = { createdAt: -1 }; // Default: newest first

    if (sort === 'price_asc') {
      sortOptions = { price: 1 }; // Lowest price to highest
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 }; // Highest price to lowest
    } else if (sort === 'name_asc') {
      sortOptions = { name: 1 }; // A-Z
    } else if (sort === 'name_desc') {
      sortOptions = { name: -1 }; // Z-A
    }

    // Execute query in MongoDB using lean() for faster read performance
    const products = await Product.find(filter)
      .select('-__v') // Exclude internal Mongoose version key
      .sort(sortOptions)
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching products',
      error: error.message,
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format. Must be a 24-character hexadecimal string.',
      });
    }

    // 2. Query MongoDB for the document
    const product = await Product.findById(id).select('-__v').lean();

    // 3. Handle document not found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found.`,
      });
    }

    // 4. Return found product
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching single product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching product details',
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
