import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme
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
    { subject: 'PAC', value: player.stats.pace },
    { subject: 'SHO', value: player.stats.shooting },
    { subject: 'PAS', value: player.stats.passing },
    { subject: 'DRI', value: player.stats.dribbling },
    { subject: 'DEF', value: player.stats.defending },
    { subject: 'PHY', value: player.stats.physical }
  ];

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" noWrap>
            {player.name}
          </Typography>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              color: getTierColor(player.tier),
              fontWeight: 'bold'
            }}
          >
            {player.stats.overall}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={player.position}
            size="small"
            sx={{
              bgcolor: getPositionColor(player.position),
              color: 'white'
            }}
          />
          <Chip
            label={player.tier}
            size="small"
            sx={{
              bgcolor: getTierColor(player.tier),
              color: 'white'
            }}
          />
          <Chip
            label={`${player.minBid} GC`}
            size="small"
            sx={{ bgcolor: theme.palette.grey[700], color: 'white' }}
          />
        </Box>

        <Box sx={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <RadarChart data={statsData}>
              <PolarGrid />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: theme.palette.text.primary }}
              />
              <Radar
                name="Stats"
                dataKey="value"
                stroke={getTierColor(player.tier)}
                fill={getTierColor(player.tier)}
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
