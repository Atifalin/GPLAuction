const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    enum: ['goalkeeper', 'defender', 'midfielder', 'attacker'],
    required: true
  },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Elite'],
    required: true
  },
  minimumBid: {
    type: Number,
    required: true
  },
  stats: {
    // Add relevant player statistics for radar chart
    pace: { type: Number, required: true },
    shooting: { type: Number, required: true },
    passing: { type: Number, required: true },
    dribbling: { type: Number, required: true },
    defending: { type: Number, required: true },
    physical: { type: Number, required: true }
  },
  isAvailableForAuction: {
    type: Boolean,
    default: true
  },
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
