require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// Immediate CORS and preflight handler for cross-site requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  // Immediately respond to preflight OPTIONS requests without routing or waiting
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

// Normalize URL for Vercel serverless rewrites so routes match seamlessly
app.use((req, res, next) => {
  if (req.originalUrl) {
    let cleanUrl = req.originalUrl.replace(/^\/api(?=\/|$)/, '') || '/';
    if (cleanUrl === '/index.js' || cleanUrl === '/index') {
      cleanUrl = '/';
    }
    req.url = cleanUrl;
  }
  next();
});

// Database connection helper with caching for serverless environments (Vercel)
let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables');
  }
  if (!cachedPromise) {
    cachedPromise = mongoose.connect(process.env.MONGO_URI).then((m) => {
      console.log('MongoDB connected successfully.');
      return m;
    });
  }
  await cachedPromise;
  return mongoose.connection;
};

// Middleware to ensure DB connection before handling API routes
app.use(async (req, res, next) => {
  // Allow health check and preflight to pass without waiting for DB
  if (req.path === '/' || req.method === 'OPTIONS') return next();

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to database',
      error: err.message,
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'ShopKart API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 5001;

// Only start the standalone HTTP listener in local development or traditional servers
// In Vercel serverless, Vercel wraps the exported app directly
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
    });
}

module.exports = app;