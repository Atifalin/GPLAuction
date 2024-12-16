const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get all users with their login status
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-pin');
    console.log('Fetched users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.pin !== pin) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' } // Extended token expiration to 7 days
    );

    // Update login status
    user.isLoggedIn = true;
    await user.save();

    console.log('User logged in successfully:', {
      userId: user._id,
      name: user.name
    });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        emoji: user.emoji,
        isLoggedIn: user.isLoggedIn
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update login status
    user.isLoggedIn = false;
    await user.save();

    console.log('User logged out successfully:', {
      userId: user._id,
      name: user.name
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ valid: false });
    }

    res.json({
      valid: true,
      user: {
        _id: user._id,
        name: user.name,
        emoji: user.emoji,
        isLoggedIn: user.isLoggedIn
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
