const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users with their login status
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-pin');
    console.log('Fetched users:', users); // Debug log
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

    // Update login status
    user.isLoggedIn = true;
    await user.save();

    res.json({
      success: true,
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

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

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
