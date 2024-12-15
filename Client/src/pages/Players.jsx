import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Divider,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PlayerCard from '../components/PlayerCard';
import { useTheme } from '@mui/material/styles';
import api from '../api/axios';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    elite: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
    goalkeeper: 0,
    defender: 0,
    midfielder: 0,
    attacker: 0
  });
  const [filters, setFilters] = useState({
    position: '',
    tier: '',
    search: ''
  });
  const [displayCount, setDisplayCount] = useState(100);
  const theme = useTheme();

  const positions = ['', 'GK', 'DEF', 'MID', 'ATT'];
  const tiers = ['', 'Elite', 'Gold', 'Silver', 'Bronze'];

  const fetchPlayers = async (limit = 100) => {
    try {
      setLoadingMore(true);
      const params = new URLSearchParams();
      if (filters.position) params.append('position', filters.position);
      if (filters.tier) params.append('tier', filters.tier);
      if (filters.search) params.append('search', filters.search);
      params.append('limit', limit);

      const response = await api.get(`/players?${params.toString()}`);
      setPlayers(response.data);
      
      // Calculate stats from full dataset
      const playerStats = response.data.reduce((acc, player) => {
        // Count by tier
        acc[player.tier.toLowerCase()]++;
        
        // Count by position
        const pos = player.position.toLowerCase();
        if (pos === 'gk') acc.goalkeeper++;
        else if (pos === 'rb' || pos === 'lb' || pos === 'cb') acc.defender++;
        else if (pos === 'cdm' || pos === 'cm' || pos === 'cam') acc.midfielder++;
        else acc.attacker++;
        
        return acc;
      }, {
        total: response.data.length,
        elite: 0,
        gold: 0,
        silver: 0,
        bronze: 0,
        goalkeeper: 0,
        defender: 0,
        midfielder: 0,
        attacker: 0
      });
      
      setStats(playerStats);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching players:', error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPlayers(displayCount);
  }, [filters, displayCount]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoadAll = () => {
    setDisplayCount(1000);
  };

  const handleClearSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: ''
    }));
  };

  const StatCard = ({ title, value, color }) => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: 3,
        borderColor: color
      }}
    >
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
        {value}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Stats Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Player Database Stats
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <StatCard title="Total Players" value={stats.total} color={theme.palette.primary.main} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <StatCard title="Elite" value={stats.elite} color="#FFD700" />
              </Grid>
              <Grid item xs={3}>
                <StatCard title="Gold" value={stats.gold} color="#DAA520" />
              </Grid>
              <Grid item xs={3}>
                <StatCard title="Silver" value={stats.silver} color="#C0C0C0" />
              </Grid>
              <Grid item xs={3}>
                <StatCard title="Bronze" value={stats.bronze} color="#CD7F32" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <StatCard title="Goalkeepers" value={stats.goalkeeper} color="#1E88E5" />
          </Grid>
          <Grid item xs={3}>
            <StatCard title="Defenders" value={stats.defender} color="#43A047" />
          </Grid>
          <Grid item xs={3}>
            <StatCard title="Midfielders" value={stats.midfielder} color="#FB8C00" />
          </Grid>
          <Grid item xs={3}>
            <StatCard title="Attackers" value={stats.attacker} color="#E53935" />
          </Grid>
        </Grid>
      </Paper>

      {/* Filters Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Position"
              name="position"
              value={filters.position}
              onChange={handleFilterChange}
            >
              {positions.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos || 'All Positions'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Tier"
              name="tier"
              value={filters.tier}
              onChange={handleFilterChange}
            >
              {tiers.map((tier) => (
                <MenuItem key={tier} value={tier}>
                  {tier || 'All Tiers'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Players"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleLoadAll}
              disabled={displayCount === 1000 || loadingMore}
              sx={{ height: '56px' }}
            >
              {loadingMore ? <CircularProgress size={24} /> : 'Load All Players'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Players Grid */}
      <Grid container spacing={3}>
        {players.map((player) => (
          <Grid item xs={12} md={6} key={player._id}>
            <PlayerCard player={player} />
          </Grid>
        ))}
      </Grid>

      {/* Loading More Indicator */}
      {loadingMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default Players;
