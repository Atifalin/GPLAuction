const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  host: {
    userId: { type: String, required: true },
    name: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed'],
    default: 'Pending'
  },
  participants: [{
    userId: { type: String, required: true },
    name: { type: String, required: true }
  }],
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  auctionedPlayers: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    winningBid: { type: Number },
    winner: {
      userId: { type: String },
      name: { type: String }
    },
    timeElapsed: { type: Number } // in seconds
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);
