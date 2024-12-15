const mongoose = require('mongoose');

const auctionPlayerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  }
}, { timestamps: true });

// Drop any existing indexes
auctionPlayerSchema.indexes().forEach(index => {
  auctionPlayerSchema.index(index[0], { ...index[1], background: true });
});

// Create new compound index on userId and player
auctionPlayerSchema.index({ userId: 1, player: 1 }, { unique: true });

const AuctionPlayer = mongoose.model('AuctionPlayer', auctionPlayerSchema);

module.exports = AuctionPlayer;
