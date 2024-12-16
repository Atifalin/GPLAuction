const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  host: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    emoji: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed'],
    default: 'Pending'
  },
  ghantaCoinsPerUser: {
    type: Number,
    required: true,
    min: 50,
    max: 500
  },
  participants: [{
    userId: { type: String, required: true },
    name: { type: String, required: true },
    emoji: { type: String, required: true },
    remainingCoins: { type: Number, required: true },
    bids: [{
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      amount: { type: Number },
      timestamp: { type: Date }
    }]
  }],
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  auctionedPlayers: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    winningBid: { type: Number, required: true },
    winner: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      emoji: { type: String, required: true }
    },
    timeElapsed: { type: Number }, // in seconds
    bidHistory: [{
      userId: { type: String, required: true },
      name: { type: String, required: true },
      emoji: { type: String, required: true },
      amount: { type: Number, required: true },
      timestamp: { type: Date, required: true, default: Date.now }
    }]
  }],
  isPaused: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  stats: {
    totalBids: { type: Number, default: 0 },
    highestBid: { type: Number, default: 0 },
    averageBid: { type: Number, default: 0 },
    totalTimeElapsed: { type: Number, default: 0 } // in seconds
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual for total players auctioned
auctionSchema.virtual('totalPlayersAuctioned').get(function() {
  return this.auctionedPlayers.length;
});

// Virtual for remaining players
auctionSchema.virtual('remainingPlayers').get(function() {
  // This will be populated by the API based on selected players minus auctioned players
  return [];
});

// Method to check if a user can afford a bid
auctionSchema.methods.canUserAffordBid = function(userId, bidAmount) {
  const participant = this.participants.find(p => p.userId === userId);
  return participant && participant.remainingCoins >= bidAmount;
};

// Method to update user's remaining coins after a successful bid
auctionSchema.methods.updateUserCoins = function(userId, bidAmount) {
  const participant = this.participants.find(p => p.userId === userId);
  if (participant) {
    participant.remainingCoins -= bidAmount;
    participant.bids.push({
      playerId: this.currentPlayer,
      amount: bidAmount,
      timestamp: new Date()
    });
  }
};

module.exports = mongoose.model('Auction', auctionSchema);
