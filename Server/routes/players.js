const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Get all players with filtering options
router.get('/', async (req, res) => {
  try {
    const { position, tier, search, limit = 100 } = req.query;
    
    // Build query
    const query = {};
    
    if (position) {
      // Handle position filter
      if (position === 'GK') {
        query.position = 'GK';
      } else if (position === 'DEF') {
        query.position = { $in: ['RB', 'LB', 'CB'] };
      } else if (position === 'MID') {
        query.position = { $in: ['CDM', 'CM', 'CAM'] };
      } else if (position === 'ATT') {
        query.position = { $in: ['RW', 'LW', 'ST', 'CF'] };
      }
    }
    
    if (tier) {
      query.tier = tier;
    }
    
    if (search) {
      query.$or = [
        { shortName: { $regex: search, $options: 'i' } },
        { longName: { $regex: search, $options: 'i' } }
      ];
    }

    // Get players with limit
    const players = await Player.find(query)
      .limit(parseInt(limit))
      .sort({ 'stats.overall': -1 });

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
