const express = require('express');
const route = express.Router();

const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
} = require('../controllers/cart.controller');
const { protectCustomer } = require('../middlewares/auth.middleware');

route.use(protectCustomer);

route.post('/:productId', addToCart);
route.get('/', getCart);
route.patch('/:productId', updateCart);
route.delete('/:productId', removeFromCart);

module.exports = route;