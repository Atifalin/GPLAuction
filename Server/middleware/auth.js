const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No authentication token found' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Find user
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.log('User not found for token:', token);
        throw new Error('User not found');
      }

      // Add user to request object
      req.user = user;
      req.token = token;
      
      next();
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      throw jwtError;
    }
  } catch (error) {
    console.log('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;
