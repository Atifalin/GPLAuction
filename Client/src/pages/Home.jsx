import React from 'react';
import { Container, Typography, Paper, Box, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  People as PeopleIcon, 
  Gavel as GavelIcon,
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon 
} from '@mui/icons-material';

const Home = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Ghanta PL Auction
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Build your dream team by bidding on the best players in the league
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          bgcolor: 'background.paper'
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Quick Start
          </Typography>
          <Typography paragraph>
            Browse through our extensive player database, participate in live auctions,
            and manage your squad all in one place.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h5" gutterBottom>
            Features
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>Browse and filter over 1000 players</li>
            <li>Real-time auction system</li>
            <li>Squad management</li>
            <li>Player statistics and insights</li>
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Button
              component={Link}
              to="/players"
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<PeopleIcon />}
              sx={{ py: 1.5 }}
            >
              View Players
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              component={Link}
              to="/auctions"
              variant="contained"
              color="secondary"
              fullWidth
              startIcon={<GavelIcon />}
              sx={{ py: 1.5 }}
            >
              View Auctions
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              component={Link}
              to="/auction-selection"
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<PersonAddIcon />}
              sx={{ py: 1.5 }}
            >
              Auction Selection
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              component={Link}
              to="/profile"
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<PersonAddIcon />}
              sx={{ py: 1.5 }}
            >
              My Profile
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              component={Link}
              to="/stats"
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<AssessmentIcon />}
              sx={{ py: 1.5 }}
            >
              View Stats
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Home;
