const axios = require('axios');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Transform } = require('stream');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// FIFA 23 dataset URL from Kaggle
const FIFA_DATASET_URL = 'https://raw.githubusercontent.com/stefanoleone992/fifa-players-ultimate-team-datasets/master/datasets/fut_bin_players_23.csv';

async function downloadFifaData() {
  try {
    console.log('Downloading FIFA 23 dataset...');
    const response = await axios.get(FIFA_DATASET_URL);
    const csvData = response.data;

    // Write raw data to file
    const rawFilePath = path.join(dataDir, 'fifa23_raw.csv');
    fs.writeFileSync(rawFilePath, csvData);
    console.log('Raw data downloaded successfully');

    // Process and filter data
    const players = [];
    const requiredPositions = {
      GK: 20,
      DEF: 200,
      MID: 400,
      ATT: 380
    };

    const positionCounts = {
      GK: 0,
      DEF: 0,
      MID: 0,
      ATT: 0
    };

    // Create transform stream to process CSV data
    const processRow = new Transform({
      objectMode: true,
      transform(row, encoding, callback) {
        // Map position to our categories
        let category;
        const position = row.position;
        
        if (position === 'GK') {
          category = 'GK';
        } else if (['RB', 'LB', 'CB', 'RWB', 'LWB'].includes(position)) {
          category = 'DEF';
        } else if (['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(position)) {
          category = 'MID';
        } else if (['RW', 'LW', 'ST', 'CF'].includes(position)) {
          category = 'ATT';
        }

        // Skip if we already have enough players in this category
        if (!category || positionCounts[category] >= requiredPositions[category]) {
          callback();
          return;
        }

        // Add player if they meet our criteria
        const player = {
          ID: row.id,
          ShortName: row.common_name || row.short_name,
          LongName: row.long_name,
          Position: position,
          Overall: parseInt(row.overall) || 75,
          Age: parseInt(row.age) || 25,
          Height: parseInt(row.height_cm) || 180,
          Weight: parseInt(row.weight_kg) || 75,
          Club: row.club_name,
          League: row.league_name,
          Nationality: row.nationality_name,
          PreferredFoot: row.preferred_foot,
          WeakFoot: parseInt(row.weak_foot) || 3,
          SkillMoves: parseInt(row.skill_moves) || 2,
          WorkRate: row.work_rate,
          Pace: parseInt(row.pace) || 50,
          Shooting: parseInt(row.shooting) || 50,
          Passing: parseInt(row.passing) || 50,
          Dribbling: parseInt(row.dribbling) || 50,
          Defending: parseInt(row.defending) || 50,
          Physical: parseInt(row.physic) || 50
        };

        players.push(player);
        positionCounts[category]++;
        callback();
      }
    });

    // Process the raw CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(rawFilePath)
        .pipe(csv())
        .pipe(processRow)
        .on('finish', resolve)
        .on('error', reject);
    });

    // Sort players by position and overall rating
    players.sort((a, b) => {
      if (a.Position === b.Position) {
        return b.Overall - a.Overall;
      }
      return a.Position.localeCompare(b.Position);
    });

    // Write processed data to CSV
    const processedFilePath = path.join(dataDir, 'players.csv');
    const header = Object.keys(players[0]).join(',') + '\n';
    const rows = players.map(player => Object.values(player).join(','));
    fs.writeFileSync(processedFilePath, header + rows.join('\n'));

    console.log('Data processing completed');
    console.log('Position distribution:', positionCounts);
    console.log(`Total players: ${players.length}`);

    // Clean up raw file
    fs.unlinkSync(rawFilePath);

  } catch (error) {
    console.error('Error downloading/processing FIFA data:', error);
    process.exit(1);
  }
}

downloadFifaData();
