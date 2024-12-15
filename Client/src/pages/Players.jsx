import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import PlayerCard from '../components/PlayerCard';
import api from '../api/axios';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    position: '',
    tier: '',
    search: ''
  });

  const positions = ['', 'GK', 'DEF', 'MID', 'ATT'];
  const tiers = ['', 'Elite', 'Gold', 'Silver', 'Bronze'];

  useEffect(() => {
    fetchPlayers();
  }, [filters]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.position) params.append('position', filters.position);
      if (filters.tier) params.append('tier', filters.tier);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/players?${params.toString()}`);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Players Database
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Position"
          name="position"
          value={filters.position}
          onChange={handleFilterChange}
          sx={{ minWidth: 120 }}
        >
          {positions.map((pos) => (
            <MenuItem key={pos} value={pos}>
              {pos || 'All Positions'}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Tier"
          name="tier"
          value={filters.tier}
          onChange={handleFilterChange}
          sx={{ minWidth: 120 }}
        >
          {tiers.map((tier) => (
            <MenuItem key={tier} value={tier}>
              {tier || 'All Tiers'}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Search"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          sx={{ flexGrow: 1 }}
          placeholder="Search by player name..."
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {players.map((player) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={player._id}>
              <PlayerCard player={player} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Players;
