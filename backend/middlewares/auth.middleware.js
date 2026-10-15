const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protectCustomer = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Support standard Bearer token header from Postman / API clients
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing authentication token',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer no longer exists',
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};

module.exports = { protectCustomer, protect: protectCustomer };