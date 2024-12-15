const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get all users with their login status
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id name emoji isLoggedIn');
    console.log('Fetched users:', users); // Debug log
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { _id, pin } = req.body;
    console.log('Login attempt for user:', _id); // Debug log
    
    const user = await User.findById(_id);
    console.log('Found user:', user); // Debug log

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isLoggedIn) {
      return res.status(400).json({ message: 'User is already logged in' });
    }

    if (user.pin !== pin) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    // Update login status
    user.isLoggedIn = true;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, name: user.name },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        emoji: user.emoji
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { _id } = req.body;
    console.log('Logout attempt for user:', _id); // Debug log
    
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isLoggedIn = false;
    await user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
