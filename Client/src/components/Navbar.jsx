import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Logout as LogoutIcon } from '@mui/icons-material';

const Navbar = ({ user, onLogout }) => {
  const theme = useTheme();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          Ghanta PL Auction
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            component={Link} 
            to="/players" 
            color="inherit"
          >
            Players
          </Button>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            bgcolor: theme.palette.background.paper,
            px: 2,
            py: 0.5,
            borderRadius: 1
          }}>
            <Typography>{user.emoji}</Typography>
            <Typography>{user.name}</Typography>
          </Box>

          <IconButton 
            color="inherit" 
            onClick={onLogout}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
