const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Player = require('../models/Player');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ghantapl', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Position mapping from FIFA positions to our schema
const positionMapping = {
  'GK': 'goalkeeper',
  'CB': 'defender', 'RB': 'defender', 'LB': 'defender', 'RWB': 'defender', 'LWB': 'defender',
  'CDM': 'midfielder', 'CM': 'midfielder', 'CAM': 'midfielder', 'RM': 'midfielder', 'LM': 'midfielder',
  'ST': 'attacker', 'CF': 'attacker', 'LW': 'attacker', 'RW': 'attacker'
};

// Tier thresholds based on overall rating
function getTierAndMinBid(overall) {
  if (overall >= 85) return { tier: 'Elite', minimumBid: 75 };
  if (overall >= 80) return { tier: 'Gold', minimumBid: 50 };
  if (overall >= 75) return { tier: 'Silver', minimumBid: 25 };
  return { tier: 'Bronze', minimumBid: 10 };
}

// Track position counts
const positionCounts = {
  goalkeeper: 0,
  defender: 0,
  midfielder: 0,
  attacker: 0
};

const targetCounts = {
  goalkeeper: 20,
  defender: 200,
  midfielder: 400,
  attacker: 380
};

async function importPlayers() {
  try {
    // Clear existing players
    await Player.deleteMany({});
    
    const players = [];
    
    // Read and process CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream('../players.csv')
        .pipe(csv())
        .on('data', (row) => {
          // Get primary position
          const primaryPosition = row.player_positions.split(',')[0].trim();
          const mappedPosition = positionMapping[primaryPosition];
          
          if (!mappedPosition) return;
          
          // Check if we need more players in this position
          if (positionCounts[mappedPosition] >= targetCounts[mappedPosition]) return;
          
          const { tier, minimumBid } = getTierAndMinBid(parseInt(row.overall));
          
          players.push({
            name: row.short_name,
            position: mappedPosition,
            tier,
            minimumBid,
            stats: {
              pace: parseInt(row.pace) || 50,
              shooting: parseInt(row.shooting) || 50,
              passing: parseInt(row.passing) || 50,
              dribbling: parseInt(row.dribbling) || 50,
              defending: parseInt(row.defending) || 50,
              physical: parseInt(row.physic) || 50
            },
            isAvailableForAuction: true
          });
          
          positionCounts[mappedPosition]++;
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Sort players by overall rating and take top players for each position
    const sortedPlayers = players.sort((a, b) => b.stats.overall - a.stats.overall);
    
    // Import players
    await Player.insertMany(sortedPlayers);
    
    console.log('Import completed successfully!');
    console.log('Position distribution:', positionCounts);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error importing players:', error);
    mongoose.connection.close();
  }
}

importPlayers();
