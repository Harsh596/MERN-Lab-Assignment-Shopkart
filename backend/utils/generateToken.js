const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateTokenAndSetCookie;