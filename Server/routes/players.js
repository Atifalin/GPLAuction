const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Get all players with filtering options
router.get('/', async (req, res) => {
  try {
    const { position, tier, search } = req.query;
    
    // Build query
    const query = {};
    
    if (position) {
      // Handle position filter
      if (position === 'GK') {
        query.position = 'GK';
      } else if (position === 'DEF') {
        query.position = { $in: ['RB', 'LB', 'CB', 'RWB', 'LWB', 'RCB', 'LCB'] };
      } else if (position === 'MID') {
        query.position = { $in: ['CDM', 'CM', 'CAM', 'RM', 'LM', 'RDM', 'LDM', 'RCM', 'LCM'] };
      } else if (position === 'ATT') {
        query.position = { $in: ['RW', 'LW', 'ST', 'CF', 'RF', 'LF', 'RS', 'LS'] };
      }
    }
    
    if (tier) {
      query.tier = tier;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { club: { $regex: search, $options: 'i' } },
        { nationality: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Player search query:', query);
    
    // Execute query without limit
    const players = await Player.find(query).sort({ overall: -1 });
    console.log(`Found ${players.length} players`);
    
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: error.message });
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
