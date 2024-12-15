const express = require('express');
const router = express.Router();
const AuctionPlayer = require('../models/AuctionPlayer');
const Player = require('../models/Player');
const auth = require('../middleware/auth');

// Get all players available for auction for a user
router.get('/available', auth, async (req, res) => {
  try {
    console.log('Fetching auction players for user:', req.user._id);
    const auctionPlayers = await AuctionPlayer.find({ userId: req.user._id })
      .populate('player');
    console.log('Found auction players:', auctionPlayers.length);
    res.json(auctionPlayers);
  } catch (error) {
    console.error('Error fetching auction players:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get default auction players for a user
router.get('/default', auth, async (req, res) => {
  try {
    console.log('Fetching default players for user:', req.user._id);
    
    // First, remove any existing auction players for this user
    await AuctionPlayer.deleteMany({ userId: req.user._id });
    
    // Function to get players with tier distribution
    const getPlayersWithTierDistribution = async (positionQuery, limit) => {
      const players = [];
      const minPerTier = 5;
      const tiers = ['Gold', 'Silver', 'Bronze'];
      
      // First, get minimum players from each tier
      for (const tier of tiers) {
        const tierPlayers = await Player.find({ ...positionQuery, tier })
          .sort({ overall: -1 })
          .limit(minPerTier);
        players.push(...tierPlayers);
      }
      
      // Then fill the remaining slots with best available players
      const remainingSlots = limit - players.length;
      if (remainingSlots > 0) {
        const existingIds = players.map(p => p._id);
        const additionalPlayers = await Player.find({
          ...positionQuery,
          _id: { $nin: existingIds }
        })
          .sort({ overall: -1 })
          .limit(remainingSlots);
        players.push(...additionalPlayers);
      }
      
      return players;
    };
    
    // Get players by position with tier distribution
    const [goalkeepers, defenders, midfielders, attackers] = await Promise.all([
      getPlayersWithTierDistribution({ position: 'GK' }, 10),
      getPlayersWithTierDistribution(
        { position: { $in: ['RB', 'LB', 'CB', 'RWB', 'LWB', 'RCB', 'LCB'] } },
        30
      ),
      getPlayersWithTierDistribution(
        { position: { $in: ['CDM', 'CM', 'CAM', 'RM', 'LM', 'RDM', 'LDM', 'RCM', 'LCM'] } },
        30
      ),
      getPlayersWithTierDistribution(
        { position: { $in: ['RW', 'LW', 'ST', 'CF', 'RF', 'LF', 'RS', 'LS'] } },
        30
      )
    ]);

    console.log('Found players by position:', {
      goalkeepers: goalkeepers.length,
      defenders: defenders.length,
      midfielders: midfielders.length,
      attackers: attackers.length
    });

    // Create auction player entries for the user
    const allPlayers = [...goalkeepers, ...defenders, ...midfielders, ...attackers];
    console.log('Total players to add:', allPlayers.length);
    
    const auctionPlayers = await Promise.all(
      allPlayers.map(player => 
        AuctionPlayer.create({
          userId: req.user._id,
          player: player._id
        })
      )
    );

    console.log('Created auction players:', auctionPlayers.length);

    // Return populated auction players
    const populatedAuctionPlayers = await AuctionPlayer.find({
      _id: { $in: auctionPlayers.map(ap => ap._id) }
    }).populate('player');

    console.log('Returning populated auction players:', populatedAuctionPlayers.length);
    
    // Log tier distribution
    const tierCounts = populatedAuctionPlayers.reduce((acc, ap) => {
      acc[ap.player.tier] = (acc[ap.player.tier] || 0) + 1;
      return acc;
    }, {});
    console.log('Tier distribution:', tierCounts);

    res.json(populatedAuctionPlayers);
  } catch (error) {
    console.error('Error creating default auction players:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a player to auction list
router.post('/add', auth, async (req, res) => {
  try {
    const { playerId } = req.body;
    console.log('Adding player to auction:', playerId);
    
    // Check if player exists
    const player = await Player.findById(playerId);
    if (!player) {
      console.log('Player not found:', playerId);
      return res.status(404).json({ message: 'Player not found' });
    }

    // Check if player is already in auction list
    const existingEntry = await AuctionPlayer.findOne({
      userId: req.user._id,
      player: playerId
    });

    if (existingEntry) {
      console.log('Player already in auction list:', playerId);
      return res.status(400).json({ message: 'Player already in auction list' });
    }

    // Add player to auction list
    const auctionPlayer = await AuctionPlayer.create({
      userId: req.user._id,
      player: playerId
    });

    const populatedAuctionPlayer = await AuctionPlayer.findById(auctionPlayer._id)
      .populate('player');

    console.log('Added player to auction list:', populatedAuctionPlayer);
    res.status(201).json(populatedAuctionPlayer);
  } catch (error) {
    console.error('Error adding player to auction:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove a player from auction list
router.delete('/remove/:playerId', auth, async (req, res) => {
  try {
    console.log('Removing player from auction:', req.params.playerId);
    const result = await AuctionPlayer.findOneAndDelete({
      userId: req.user._id,
      player: req.params.playerId
    });

    if (!result) {
      console.log('Player not found in auction list:', req.params.playerId);
      return res.status(404).json({ message: 'Player not found in auction list' });
    }

    console.log('Removed player from auction list:', result);
    res.json({ message: 'Player removed from auction list' });
  } catch (error) {
    console.error('Error removing player from auction:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
