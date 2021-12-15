const jwt = require('jsonwebtoken');
const { promisify } = require('util');
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.SECRET_KEY || 'somethingsecret',
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );
};

exports.verifyToken = async (token) => {
  return await promisify(jwt.verify)(token, process.env.SECRET_KEY);
};
