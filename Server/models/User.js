const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    alias: 'userId'
  },
  name: {
    type: String,
    required: true
  },
  pin: {
    type: String,
    required: true,
    default: '0000',
    validate: {
      validator: function(v) {
        return /^\d{4}$/.test(v); // Ensure pin is exactly 4 digits
      },
      message: props => `${props.value} is not a valid 4-digit PIN!`
    }
  },
  emoji: {
    type: String,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  mainXI: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  squad: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    acquiredFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' },
    price: { type: Number },
    acquiredAt: { type: Date }
  }],
  currentAuctions: [{
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' },
    remainingCoins: { type: Number },
    role: { type: String, enum: ['Host', 'Participant'] },
    joinedAt: { type: Date, default: Date.now }
  }],
  stats: {
    totalAuctions: { type: Number, default: 0 },
    auctionsHosted: { type: Number, default: 0 },
    auctionsWon: { type: Number, default: 0 },
    totalCoinsSpent: { type: Number, default: 0 },
    averageCoinsSpent: { type: Number, default: 0 },
    biggestBid: { 
      amount: { type: Number, default: 0 },
      player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' }
    },
    frequentlyBoughtPlayers: [{
      player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      count: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 }
    }],
    bidStats: {
      totalBids: { type: Number, default: 0 },
      successfulBids: { type: Number, default: 0 },
      outbidCount: { type: Number, default: 0 }
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual for total players owned
userSchema.virtual('totalPlayers').get(function() {
  return this.squad.length;
});

// Virtual for current auction participation
userSchema.virtual('isInAuction').get(function() {
  return this.currentAuctions.length > 0;
});

// Method to join an auction
userSchema.methods.joinAuction = async function(auctionId, ghantaCoins, role = 'Participant') {
  this.currentAuctions.push({
    auctionId,
    remainingCoins: ghantaCoins,
    role,
    joinedAt: new Date()
  });
  this.stats.totalAuctions += 1;
  if (role === 'Host') {
    this.stats.auctionsHosted += 1;
  }
  await this.save();
};

// Method to leave an auction
userSchema.methods.leaveAuction = async function(auctionId) {
  this.currentAuctions = this.currentAuctions.filter(a => a.auctionId.toString() !== auctionId.toString());
  await this.save();
};

// Method to add a player to squad
userSchema.methods.addToSquad = async function(playerId, auctionId, price) {
  this.squad.push({
    player: playerId,
    acquiredFrom: auctionId,
    price,
    acquiredAt: new Date()
  });
  
  // Update stats
  this.stats.totalCoinsSpent += price;
  this.stats.averageCoinsSpent = this.stats.totalCoinsSpent / this.squad.length;
  
  if (price > this.stats.biggestBid.amount) {
    this.stats.biggestBid = {
      amount: price,
      player: playerId,
      auction: auctionId
    };
  }

  // Update frequently bought players
  const playerStat = this.stats.frequentlyBoughtPlayers.find(p => p.player.toString() === playerId.toString());
  if (playerStat) {
    playerStat.count += 1;
    playerStat.totalSpent += price;
  } else {
    this.stats.frequentlyBoughtPlayers.push({
      player: playerId,
      count: 1,
      totalSpent: price
    });
  }

  await this.save();
};

module.exports = mongoose.model('User', userSchema);
