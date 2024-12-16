const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const User = require('../models/User');
const AuctionPlayer = require('../models/AuctionPlayer'); // Added this line
const auth = require('../middleware/auth');

// Get all auctions
router.get('/', auth, async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate('currentPlayer')
      .populate('auctionedPlayers.player');
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new auction
router.post('/create', auth, async (req, res) => {
  try {
    const { name, ghantaCoins } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Auction name is required' });
    }

    if (!ghantaCoins || ghantaCoins < 50 || ghantaCoins > 1000) {
      return res.status(400).json({ message: 'Ghanta Coins must be between 50 and 1000' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has selected enough players
    const selectedPlayersCount = await AuctionPlayer.countDocuments({ userId: user._id.toString() });
    if (selectedPlayersCount < 50) {
      return res.status(400).json({ 
        message: 'You need to select at least 50 players before creating an auction',
        redirect: '/auction-selection'
      });
    }

    const auction = new Auction({
      name,
      host: {
        userId: user._id,
        name: user.name,
        emoji: user.emoji
      },
      ghantaCoinsPerUser: ghantaCoins,
      status: 'Pending'
    });

    const newAuction = await auction.save();

    // Add auction to user's hosted auctions
    await user.joinAuction(newAuction._id, ghantaCoins, 'Host');

    res.status(201).json(newAuction);
  } catch (error) {
    console.error('Auction creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Join auction
router.post('/:id/join', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a participant
    if (auction.participants.some(p => p.userId === user._id)) {
      return res.status(400).json({ message: 'Already joined this auction' });
    }

    // Add user to participants with initial coins
    auction.participants.push({
      userId: user._id,
      name: user.name,
      emoji: user.emoji,
      remainingCoins: auction.ghantaCoinsPerUser,
      bids: []
    });

    await auction.save();

    // Update user's auction participation
    await user.joinAuction(auction._id, auction.ghantaCoinsPerUser, 'Participant');

    res.json(auction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Start auction
router.post('/:id/start', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Verify host
    if (auction.host.userId !== req.user._id) {
      return res.status(403).json({ message: 'Only host can start the auction' });
    }

    auction.status = 'Active';
    auction.startTime = new Date();
    const updatedAuction = await auction.save();
    res.json(updatedAuction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Pause/Resume auction
router.post('/:id/pause', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Verify host
    if (auction.host.userId !== req.user._id) {
      return res.status(403).json({ message: 'Only host can pause/resume the auction' });
    }

    auction.isPaused = !auction.isPaused;
    const updatedAuction = await auction.save();
    res.json(updatedAuction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// End auction
router.post('/:id/end', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Verify host
    if (auction.host.userId !== req.user._id) {
      return res.status(403).json({ message: 'Only host can end the auction' });
    }

    auction.status = 'Completed';
    auction.endTime = new Date();
    const updatedAuction = await auction.save();
    res.json(updatedAuction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete auction
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Delete auction request:', {
      auctionId: req.params.id,
      userId: req.user._id
    });

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      console.log('Auction not found:', req.params.id);
      return res.status(404).json({ message: 'Auction not found' });
    }

    console.log('Auction found:', {
      auctionId: auction._id,
      hostId: auction.host.userId,
      requesterId: req.user._id,
      status: auction.status
    });

    // Only host can delete auction
    if (auction.host.userId.toString() !== req.user._id.toString()) {
      console.log('Unauthorized delete attempt:', {
        hostId: auction.host.userId,
        requesterId: req.user._id
      });
      return res.status(403).json({ message: 'Only the host can delete this auction' });
    }

    // Can only delete pending auctions
    if (auction.status !== 'Pending') {
      console.log('Invalid auction status for deletion:', auction.status);
      return res.status(400).json({ message: 'Can only delete pending auctions' });
    }

    // Remove auction from all participants' currentAuctions
    await User.updateMany(
      { 'currentAuctions.auctionId': auction._id },
      { $pull: { currentAuctions: { auctionId: auction._id } } }
    );

    await Auction.findByIdAndDelete(req.params.id);
    console.log('Auction deleted successfully:', req.params.id);
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('Delete auction error:', {
      error: error.message,
      stack: error.stack,
      auctionId: req.params.id,
      userId: req.user?._id
    });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
