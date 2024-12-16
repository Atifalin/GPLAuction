import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Collapse,
  IconButton,
  Paper,
  Stack,
  Alert,
  Snackbar
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AuctionDetailCard from '../components/AuctionDetailCard';
import CreateAuctionDialog from '../components/CreateAuctionDialog';
import { auctionService } from '../api/auctionService';
import { socket } from '../socket';

const AuctionsHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [completedAuctions, setCompletedAuctions] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch auctions
  const fetchAuctions = async () => {
    try {
      const auctions = await auctionService.getAllAuctions();
      setActiveAuctions(auctions.filter(a => a.status !== 'Completed'));
      setCompletedAuctions(auctions.filter(a => a.status === 'Completed'));
      setLoading(false);
    } catch (error) {
      setError('Failed to load auctions');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();

    // Socket event listeners
    socket.on('auctionStateUpdate', () => {
      fetchAuctions(); // Refresh full list on any state update
    });

    socket.on('participantUpdate', () => {
      fetchAuctions(); // Refresh full list on participant changes
    });

    socket.on('auctionDeleted', () => {
      fetchAuctions(); // Refresh full list when auction is deleted
    });

    return () => {
      socket.off('auctionStateUpdate');
      socket.off('participantUpdate');
      socket.off('auctionDeleted');
    };
  }, []);

  // Check for messages in location state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true, state: {} });
      // Refresh the list when we get a new message (like after deletion)
      fetchAuctions();
    }
  }, [location.state]);

  const handleCreateAuction = async (auctionData) => {
    try {
      const newAuction = await auctionService.createAuction({
        name: auctionData.name,
        ghantaCoins: parseInt(auctionData.ghantaCoins)
      });
      setActiveAuctions(prev => [...prev, newAuction]);
      setCreateDialogOpen(false);
      // Navigate with success message
      navigate('/auctions', { 
        state: { 
          message: 'Auction created successfully'
        }
      });
    } catch (error) {
      console.error('Creation error:', error);
      if (error.response?.data?.redirect) {
        setError('You need to select at least 50 players before creating an auction');
        // Wait a bit before redirecting to show the error message
        setTimeout(() => {
          navigate(error.response.data.redirect);
        }, 2000);
      } else {
        setError(error.response?.data?.message || 'Failed to create auction');
      }
    }
  };

  const handleJoinAuction = async (auctionId) => {
    try {
      const updatedAuction = await auctionService.joinAuction(auctionId);
      setActiveAuctions(prev => prev.map(auction => 
        auction._id === auctionId ? updatedAuction : auction
      ));
      socket.emit('joinAuctionRoom', auctionId);
      setSuccessMessage('Successfully joined the auction');
      navigate(`/auction/${auctionId}`);
    } catch (error) {
      setError('Failed to join auction');
    }
  };

  const handleViewAuction = (auctionId) => {
    navigate(`/auction/${auctionId}`);
  };

  return (
    <Container maxWidth="lg">
      <CreateAuctionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateAuction}
      />
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
            color: 'white',
            borderRadius: 2,
            mb: 4
          }}
        >
          <Typography variant="h4" gutterBottom>
            Auctions Home
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Create or join auctions to build your dream team!
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create New Auction
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<FormatListBulletedIcon />}
              component={Link}
              to="/auction-selection"
            >
              Manage Player Selection
            </Button>
          </Stack>
        </Paper>

        {/* Active & Pending Auctions Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Active & Pending Auctions
          </Typography>
          <Stack spacing={2}>
            {activeAuctions.map(auction => (
              <AuctionDetailCard
                key={auction._id}
                auction={auction}
                currentUser={JSON.parse(localStorage.getItem('user'))}
                onJoin={handleJoinAuction}
                onView={handleViewAuction}
                onError={setError}
              />
            ))}
            {activeAuctions.length === 0 && (
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No active or pending auctions at the moment
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Completed Auctions Section */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1} 
            onClick={() => setShowCompleted(!showCompleted)}
            sx={{ cursor: 'pointer', mb: showCompleted ? 2 : 0 }}
          >
            <Typography variant="h5" component="h2">
              Completed Auctions
            </Typography>
            <IconButton size="small">
              {showCompleted ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>

          <Collapse in={showCompleted}>
            <Stack spacing={2}>
              {completedAuctions.map(auction => (
                <AuctionDetailCard
                  key={auction._id}
                  auction={auction}
                  currentUser={JSON.parse(localStorage.getItem('user'))}
                  onView={handleViewAuction}
                  onError={setError}
                />
              ))}
              {completedAuctions.length === 0 && (
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  No completed auctions yet
                </Typography>
              )}
            </Stack>
          </Collapse>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuctionsHome;
