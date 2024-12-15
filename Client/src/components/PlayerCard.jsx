import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
  Grid
} from '@mui/material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';

const getTierColor = (tier) => {
  switch (tier) {
    case 'Elite':
      return '#FF4081';
    case 'Gold':
      return '#FFD700';
    case 'Silver':
      return '#C0C0C0';
    case 'Bronze':
      return '#CD7F32';
    default:
      return '#757575';
  }
};

const getPositionColor = (position) => {
  switch (position) {
    case 'GK':
      return '#4CAF50';
    case 'DEF':
      return '#2196F3';
    case 'MID':
      return '#FF9800';
    case 'ATT':
      return '#F44336';
    default:
      return '#757575';
  }
};

const PlayerCard = ({ player }) => {
  const theme = useTheme();

  const statsData = [
    { name: 'PAC', value: player.stats.pace },
    { name: 'SHO', value: player.stats.shooting },
    { name: 'PAS', value: player.stats.passing },
    { name: 'DRI', value: player.stats.dribbling },
    { name: 'DEF', value: player.stats.defending },
    { name: 'PHY', value: player.stats.physical }
  ];

  const getTierGradient = (tier) => {
    if (tier === 'Elite') {
      return 'linear-gradient(135deg, #FFD700 0%, #FF4444 100%)';
    }
    return getTierColor(tier);
  };

  const getRadarColor = (tier) => {
    switch (tier) {
      case 'Elite':
        return { stroke: '#FFD700', fill: '#FF4444' };
      case 'Gold':
        return { stroke: '#FFD700', fill: '#DAA520' };
      case 'Silver':
        return { stroke: '#C0C0C0', fill: '#A9A9A9' };
      case 'Bronze':
        return { stroke: '#CD7F32', fill: '#8B4513' };
      default:
        return { stroke: '#000000', fill: '#666666' };
    }
  };

  const radarColors = getRadarColor(player.tier);

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: 3,
        borderColor: getTierColor(player.tier),
        borderRadius: 2,
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.2s ease-in-out'
        }
      }}
    >
      <CardContent sx={{ height: '100%', p: 3 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Left Column - Player Info */}
          <Grid item xs={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              {/* Name */}
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.text.primary,
                }}
              >
                {player.shortName}
              </Typography>

              {/* Overall Rating */}
              <Chip 
                label={player.overall}
                size="large"
                sx={{ 
                  background: getTierGradient(player.tier),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  height: 36,
                  minWidth: 48
                }}
              />
            </Box>

            {/* Position chips */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                label={player.position}
                size="medium"
                sx={{ 
                  backgroundColor: getPositionColor(player.position), 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              {player.alternatePositions && player.alternatePositions.slice(0, 2).map((pos, idx) => (
                <Chip
                  key={idx}
                  label={pos}
                  size="medium"
                  variant="outlined"
                  sx={{ 
                    borderColor: getPositionColor(pos), 
                    color: getPositionColor(pos),
                    fontWeight: 'bold'
                  }}
                />
              ))}
            </Box>

            {/* Club and nationality info */}
            <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
              {player.club}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              {player.league}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {player.nationality}
              {player.nationNumber && ` #${player.nationNumber}`}
            </Typography>

            {/* Cost */}
            <Chip
              label={`${player.minimumBid} GC`}
              size="medium"
              color="primary"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: theme.palette.success.main
              }}
            />
          </Grid>

          {/* Right Column - Stats Radar */}
          <Grid item xs={7}>
            {/* Radar Chart */}
            <Box sx={{ height: 320, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={statsData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="name" 
                    tick={{ fill: theme.palette.text.primary, fontSize: 14 }}
                  />
                  <Radar
                    name={player.shortName}
                    dataKey="value"
                    stroke={radarColors.stroke}
                    fill={radarColors.fill}
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
