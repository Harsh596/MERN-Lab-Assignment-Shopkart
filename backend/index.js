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

// Allowed origins for CORS (supports local dev and deployed frontend)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5001',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

// Normalize URL for Vercel serverless rewrites so routes match seamlessly
app.use((req, res, next) => {
  if (req.originalUrl) {
    req.url = req.originalUrl.replace(/^\/api(?=\/|$)/, '') || '/';
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
  // Allow health check to pass even if DB is connecting
  if (req.path === '/') return next();

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