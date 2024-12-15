const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Get all players with filtering options
router.get('/', async (req, res) => {
  try {
    const { position, tier, search } = req.query;
    let query = {};

    // Apply filters
    if (position) query.position = position;
    if (tier) query.tier = tier;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const players = await Player.find(query)
      .sort({ 'stats.overall': -1 })
      .limit(50); // Paginate results to avoid overwhelming response

    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single player by ID
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
