const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  playerId: { type: String, required: true, unique: true },
  shortName: { type: String, required: true },
  longName: { type: String, required: true },
  position: { type: String, required: true },
  alternatePositions: [String],
  overall: { type: Number, required: true },
  age: { type: Number, required: true },
  height: { type: Number, required: true }, // in cm
  weight: { type: Number, required: true }, // in kg
  
  // Club info
  club: { type: String, required: true },
  league: { type: String, required: true },
  
  // Nation info
  nationality: { type: String, required: true },
  
  // Player characteristics
  preferredFoot: { type: String, required: true },
  weakFoot: { type: Number, required: true },
  skillMoves: { type: Number, required: true },
  workRate: { type: String, required: true },
  
  // Auction related
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Elite'],
    required: true
  },
  minimumBid: {
    type: Number,
    required: true
  },
  isAvailableForAuction: {
    type: Boolean,
    default: true
  },
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Player stats
  stats: {
    pace: { type: Number, required: true },
    shooting: { type: Number, required: true },
    passing: { type: Number, required: true },
    dribbling: { type: Number, required: true },
    defending: { type: Number, required: true },
    physical: { type: Number, required: true },
    
    // Detailed stats
    attacking: {
      crossing: { type: Number, required: true },
      finishing: { type: Number, required: true },
      headingAccuracy: { type: Number, required: true },
      shortPassing: { type: Number, required: true },
      volleys: { type: Number, required: true }
    },
    skill: {
      dribbling: { type: Number, required: true },
      curve: { type: Number, required: true },
      fkAccuracy: { type: Number, required: true },
      longPassing: { type: Number, required: true },
      ballControl: { type: Number, required: true }
    },
    movement: {
      acceleration: { type: Number, required: true },
      sprintSpeed: { type: Number, required: true },
      agility: { type: Number, required: true },
      reactions: { type: Number, required: true },
      balance: { type: Number, required: true }
    },
    power: {
      shotPower: { type: Number, required: true },
      jumping: { type: Number, required: true },
      stamina: { type: Number, required: true },
      strength: { type: Number, required: true },
      longShots: { type: Number, required: true }
    },
    mentality: {
      aggression: { type: Number, required: true },
      interceptions: { type: Number, required: true },
      positioning: { type: Number, required: true },
      vision: { type: Number, required: true },
      penalties: { type: Number, required: true },
      composure: { type: Number, required: true }
    },
    defending: {
      marking: { type: Number, required: true },
      standingTackle: { type: Number, required: true },
      slidingTackle: { type: Number, required: true }
    },
    goalkeeping: {
      diving: { type: Number, required: true },
      handling: { type: Number, required: true },
      kicking: { type: Number, required: true },
      positioning: { type: Number, required: true },
      reflexes: { type: Number, required: true }
    }
  },
  
  // Special attributes
  traits: [String],
  specialities: [String]
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
