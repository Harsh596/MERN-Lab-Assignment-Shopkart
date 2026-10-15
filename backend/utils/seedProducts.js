require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');

// Clean category names helper (e.g. "home-decoration" -> "Home Decoration")
const formatCategory = (rawCategory) => {
  if (!rawCategory || typeof rawCategory !== 'string') return 'General';
  return rawCategory
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');

    console.log('Fetching live product data from https://dummyjson.com/products?limit=100...');
    const response = await fetch('https://dummyjson.com/products?limit=100');

    if (!response.ok) {
      throw new Error(`Failed to fetch from DummyJSON API: HTTP ${response.status}`);
    }

    const data = await response.json();
    const externalProducts = Array.isArray(data.products) ? data.products : [];
    console.log(`Successfully retrieved ${externalProducts.length} items from DummyJSON API.`);

    // Map external products to ShopKart Product Model schema
    const formattedProducts = externalProducts.map((item, index) => {
      // Convert USD price to realistic INR equivalent (e.g. $10 * 80 = ₹800)
      const inrPrice = Math.max(99, Math.round(Number(item.price || 1) * 80));
      // Use DummyJSON stock or fallback to realistic stock
      const stockUnits =
        typeof item.stock === 'number' && item.stock >= 0
          ? Math.max(5, Math.round(item.stock))
          : 10 + ((index * 7 + 5) % 45);

      const imageUrl =
        item.thumbnail ||
        (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null) ||
        'https://placehold.co/600x400';

      return {
        name: item.title ? item.title.trim().slice(0, 195) : `Product ${index + 1}`,
        description: (item.description || 'Quality product available on ShopKart').trim(),
        price: inrPrice,
        category: formatCategory(item.category),
        image: imageUrl,
        stock: stockUnits,
      };
    });

    // 1. Remove all previous products entirely
    console.log('Clearing all previous products from MongoDB...');
    const deleteResult = await Product.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} old products from database.`);

    // 2. Clear old product references from customer carts and wishlists to prevent stale IDs
    console.log('Clearing stale cart and wishlist references from Customer documents...');
    await Customer.updateMany({}, { $set: { cart: [], wishlist: [] } });
    console.log('Customer carts and wishlists reset.');

    // 3. Insert newly transformed products
    console.log(`Inserting ${formattedProducts.length} products into MongoDB...`);
    const inserted = await Product.insertMany(formattedProducts);
    console.log(`🎉 Successfully seeded ${inserted.length} products into ShopKart database!`);

    console.log('\nSample Seeded Products:');
    inserted.slice(0, 3).forEach((p, idx) => {
      console.log(`\n[Product ${idx + 1}]`);
      console.log({
        id: p._id,
        name: p.name,
        category: p.category,
        price: `₹${p.price}`,
        stock: `${p.stock} units`,
        image: p.image,
      });
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

// Execute if run directly via `node utils/seedProducts.js`
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
