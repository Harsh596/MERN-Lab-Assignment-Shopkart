const bcrypt = require('bcryptjs');
const Customer = require('../models/customer.model');
const generateTokenAndSetCookie = require('../utils/generateToken');

// Task 1: Register
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters',
      });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCustomer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Task 2: Login
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateTokenAndSetCookie(res, customer._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Task 3: My Profile
const getProfile = async (req, res) => {
  return res.status(200).json(req.user);
};

// Task 4: Logout
const logoutCustomer = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};



module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
};