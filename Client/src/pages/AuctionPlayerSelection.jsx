import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../api/axios';

const AuctionPlayerSelection = () => {
  const [allPlayers, setAllPlayers] = useState([]);
  const [auctionPlayers, setAuctionPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  // Load players
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching players data...');
        
        const [playersRes, auctionPlayersRes] = await Promise.all([
          api.get('/players'),
          api.get('/auction-players/available')
        ]);

        console.log('Fetched players:', playersRes.data.length);
        console.log('Fetched auction players:', auctionPlayersRes.data.length);

        setAllPlayers(playersRes.data);
        setAuctionPlayers(auctionPlayersRes.data);
      } catch (error) {
        console.error('Error fetching players:', error);
        setError(error.response?.data?.message || 'Failed to load players');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset to default selection
  const resetToDefault = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Resetting to default selection...');
      
      const response = await api.get('/auction-players/default');
      console.log('Reset response:', response.data);
      
      setAuctionPlayers(response.data);
    } catch (error) {
      console.error('Error resetting to default:', error);
      setError(error.response?.data?.message || 'Failed to reset selection');
    } finally {
      setLoading(false);
    }
  };

  // Add player to auction list
  const addToAuction = async (player) => {
    try {
      console.log('Adding player to auction:', player._id);
      const response = await api.post('/auction-players/add', { playerId: player._id });
      console.log('Add response:', response.data);
      
      setAuctionPlayers([...auctionPlayers, response.data]);
    } catch (error) {
      console.error('Error adding player:', error);
      setError(error.response?.data?.message || 'Failed to add player');
    }
  };

  // Remove player from auction list
  const removeFromAuction = async (playerId) => {
    try {
      console.log('Removing player from auction:', playerId);
      await api.delete(`/auction-players/remove/${playerId}`);
      
      setAuctionPlayers(auctionPlayers.filter(ap => ap.player._id !== playerId));
    } catch (error) {
      console.error('Error removing player:', error);
      setError(error.response?.data?.message || 'Failed to remove player');
    }
  };

  // Filter players
  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.longName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = !positionFilter || player.position === positionFilter;
    const matchesTier = !tierFilter || player.tier === tierFilter;
    return matchesSearch && matchesPosition && matchesTier;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Auction Player Selection
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={resetToDefault}
            style={{ marginBottom: '1rem' }}
          >
            Reset to Default Selection
          </Button>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        )}

        {/* Filters */}
        <Grid item xs={12}>
          <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Search Players"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Position</InputLabel>
                  <Select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    label="Position"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="GK">Goalkeeper</MenuItem>
                    <MenuItem value="DEF">Defender</MenuItem>
                    <MenuItem value="MID">Midfielder</MenuItem>
                    <MenuItem value="ATT">Attacker</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Tier</InputLabel>
                  <Select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    label="Tier"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Elite">Elite</MenuItem>
                    <MenuItem value="Gold">Gold</MenuItem>
                    <MenuItem value="Silver">Silver</MenuItem>
                    <MenuItem value="Bronze">Bronze</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Player Lists */}
        <Grid item xs={12} md={6}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                All Players
                <Chip
                  label={`${filteredPlayers.length} players`}
                  color="primary"
                  size="small"
                  style={{ marginLeft: '1rem' }}
                />
              </Typography>
            </Box>
            <Divider />
            <List style={{ maxHeight: '600px', overflow: 'auto' }}>
              {filteredPlayers.map(player => (
                <React.Fragment key={player._id}>
                  <ListItem>
                    <ListItemText
                      primary={player.shortName}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="textPrimary">
                            {player.position} | {player.overall} OVR | {player.tier}
                          </Typography>
                          <br />
                          {player.club} ({player.league})
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => addToAuction(player)}
                        color="primary"
                        disabled={auctionPlayers.some(ap => ap.player._id === player._id)}
                      >
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Available for Auction
                <Chip
                  label={`${auctionPlayers.length} players`}
                  color="secondary"
                  size="small"
                  style={{ marginLeft: '1rem' }}
                />
              </Typography>
            </Box>
            <Divider />
            <List style={{ maxHeight: '600px', overflow: 'auto' }}>
              {auctionPlayers.map(ap => (
                <React.Fragment key={ap._id}>
                  <ListItem>
                    <ListItemText
                      primary={ap.player.shortName}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="textPrimary">
                            {ap.player.position} | {ap.player.overall} OVR | {ap.player.tier}
                          </Typography>
                          <br />
                          {ap.player.club} ({ap.player.league})
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => removeFromAuction(ap.player._id)}
                        color="error"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuctionPlayerSelection;
