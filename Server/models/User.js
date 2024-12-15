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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  stats: {
    totalAuctions: { type: Number, default: 0 },
    averageCoinsSpent: { type: Number, default: 0 },
    biggestBid: { type: Number, default: 0 },
    frequentlyBoughtPlayers: [{
      player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      count: { type: Number, default: 0 }
    }]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema);
