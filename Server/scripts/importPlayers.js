const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Player = require('../models/Player');

// Helper function to safely parse number
function safeParseInt(value, defaultValue = 0) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

async function importPlayers() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/GhantaPLAuction');
    console.log('Connected to MongoDB');

    // Clear existing players
    await Player.deleteMany({});
    console.log('Cleared existing players');
    
    const players = new Map(); // Use Map to handle duplicates
    const positionGroups = {
      GK: [],
      DEF: [],
      MID: [],
      ATT: []
    };
    
    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../data/players.csv'))
        .pipe(csv())
        .on('data', (row) => {
          // Get main position and map to our categories
          const positions = row.player_positions?.split(',').map(p => p.trim()) || [];
          const mainPosition = positions[0];
          const category = getCategory(mainPosition);

          // Skip if no valid category
          if (!category) {
            return;
          }

          const player = {
            playerId: row.player_id,
            shortName: row.short_name,
            longName: row.long_name,
            position: mainPosition,
            alternatePositions: positions.slice(1),
            overall: safeParseInt(row.overall),
            age: safeParseInt(row.age),
            height: safeParseInt(row.height_cm),
            weight: safeParseInt(row.weight_kg),
            club: row.club_name || 'Free Agent',
            league: row.league_name || 'No League',
            nationality: row.nationality_name || 'Unknown',
            preferredFoot: row.preferred_foot || 'Right',
            weakFoot: safeParseInt(row.weak_foot),
            skillMoves: safeParseInt(row.skill_moves),
            workRate: row.work_rate || 'Medium/Medium',
            stats: {
              pace: safeParseInt(row.pace),
              shooting: safeParseInt(row.shooting),
              passing: safeParseInt(row.passing),
              dribbling: safeParseInt(row.dribbling),
              defending: safeParseInt(row.defending),
              physical: safeParseInt(row.physic),
              // Detailed stats
              attacking: {
                crossing: safeParseInt(row.attacking_crossing),
                finishing: safeParseInt(row.attacking_finishing),
                headingAccuracy: safeParseInt(row.attacking_heading_accuracy),
                shortPassing: safeParseInt(row.attacking_short_passing),
                volleys: safeParseInt(row.attacking_volleys)
              },
              skill: {
                dribbling: safeParseInt(row.skill_dribbling),
                curve: safeParseInt(row.skill_curve),
                fkAccuracy: safeParseInt(row.skill_fk_accuracy),
                longPassing: safeParseInt(row.skill_long_passing),
                ballControl: safeParseInt(row.skill_ball_control)
              },
              movement: {
                acceleration: safeParseInt(row.movement_acceleration),
                sprintSpeed: safeParseInt(row.movement_sprint_speed),
                agility: safeParseInt(row.movement_agility),
                reactions: safeParseInt(row.movement_reactions),
                balance: safeParseInt(row.movement_balance)
              },
              power: {
                shotPower: safeParseInt(row.power_shot_power),
                jumping: safeParseInt(row.power_jumping),
                stamina: safeParseInt(row.power_stamina),
                strength: safeParseInt(row.power_strength),
                longShots: safeParseInt(row.power_long_shots)
              },
              mentality: {
                aggression: safeParseInt(row.mentality_aggression),
                interceptions: safeParseInt(row.mentality_interceptions),
                positioning: safeParseInt(row.mentality_positioning),
                vision: safeParseInt(row.mentality_vision),
                penalties: safeParseInt(row.mentality_penalties),
                composure: safeParseInt(row.mentality_composure)
              },
              defending: {
                marking: safeParseInt(row.defending_marking_awareness),
                standingTackle: safeParseInt(row.defending_standing_tackle),
                slidingTackle: safeParseInt(row.defending_sliding_tackle)
              },
              goalkeeping: {
                diving: safeParseInt(row.goalkeeping_diving),
                handling: safeParseInt(row.goalkeeping_handling),
                kicking: safeParseInt(row.goalkeeping_kicking),
                positioning: safeParseInt(row.goalkeeping_positioning),
                reflexes: safeParseInt(row.goalkeeping_reflexes)
              }
            }
          };

          // Skip players with invalid data
          if (!player.shortName || !player.longName || !player.overall) {
            return;
          }

          // Handle duplicates by keeping the one with higher overall rating
          const existingPlayer = players.get(player.playerId);
          if (!existingPlayer || player.overall > existingPlayer.overall) {
            players.set(player.playerId, player);
            
            // Update position groups (remove old player if it exists)
            if (existingPlayer) {
              const oldCategory = getCategory(existingPlayer.position);
              if (oldCategory) {
                const index = positionGroups[oldCategory].findIndex(p => p.playerId === existingPlayer.playerId);
                if (index !== -1) {
                  positionGroups[oldCategory].splice(index, 1);
                }
              }
            }
            positionGroups[category].push(player);
          }
        })
        .on('end', () => {
          // Sort each position group by overall rating
          Object.keys(positionGroups).forEach(key => {
            positionGroups[key].sort((a, b) => b.overall - a.overall);
          });

          console.log('Initial position counts:', {
            GK: positionGroups.GK.length,
            DEF: positionGroups.DEF.length,
            MID: positionGroups.MID.length,
            ATT: positionGroups.ATT.length
          });

          // Take required number of players from each position
          const selectedPlayers = [
            ...positionGroups.GK.slice(0, 20),
            ...positionGroups.DEF.slice(0, 200),
            ...positionGroups.MID.slice(0, 400),
            ...positionGroups.ATT.slice(0, 380)
          ];

          // Create set of elite players (top 10 from each position)
          const elitePlayers = new Set([
            ...positionGroups.GK.slice(0, 10),
            ...positionGroups.DEF.slice(0, 10),
            ...positionGroups.MID.slice(0, 10),
            ...positionGroups.ATT.slice(0, 10)
          ].map(p => p.playerId));

          // Assign tiers and minimum bids
          const processedPlayers = selectedPlayers.map(player => ({
            ...player,
            tier: elitePlayers.has(player.playerId) ? 'Elite' :
                  player.overall >= 83 ? 'Gold' :
                  player.overall >= 75 ? 'Silver' :
                  'Bronze',
            minimumBid: elitePlayers.has(player.playerId) ? 75 :
                       player.overall >= 83 ? 50 :
                       player.overall >= 75 ? 25 :
                       10
          }));

          // Save processed players
          Player.insertMany(processedPlayers)
            .then(() => {
              console.log('Final position distribution:', {
                GK: processedPlayers.filter(p => p.position === 'GK').length,
                DEF: processedPlayers.filter(p => ['RB', 'LB', 'CB', 'RWB', 'LWB', 'RCB', 'LCB'].includes(p.position)).length,
                MID: processedPlayers.filter(p => ['CDM', 'CM', 'CAM', 'RM', 'LM', 'RDM', 'LDM', 'RCM', 'LCM'].includes(p.position)).length,
                ATT: processedPlayers.filter(p => ['RW', 'LW', 'ST', 'CF', 'RF', 'LF', 'RS', 'LS'].includes(p.position)).length
              });
              console.log('Tier distribution:', processedPlayers.reduce((acc, p) => {
                acc[p.tier] = (acc[p.tier] || 0) + 1;
                return acc;
              }, {}));
              console.log(`Imported ${processedPlayers.length} players`);
              resolve();
            })
            .catch(reject);
        })
        .on('error', reject);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error importing players:', error);
    process.exit(1);
  }
}

// Helper function to get category from position
function getCategory(position) {
  if (position === 'GK') {
    return 'GK';
  } else if (['RB', 'LB', 'CB', 'RWB', 'LWB', 'RCB', 'LCB'].includes(position)) {
    return 'DEF';
  } else if (['CDM', 'CM', 'CAM', 'RM', 'LM', 'RDM', 'LDM', 'RCM', 'LCM'].includes(position)) {
    return 'MID';
  } else if (['RW', 'LW', 'ST', 'CF', 'RF', 'LF', 'RS', 'LS'].includes(position)) {
    return 'ATT';
  }
  return null;
}

importPlayers();
