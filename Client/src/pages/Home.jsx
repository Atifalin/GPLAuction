import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

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

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button
            component={Link}
            to="/players"
            variant="contained"
            size="large"
          >
            View Players
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;
