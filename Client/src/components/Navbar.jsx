import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Chip,
  Avatar,
  Divider,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Gavel as GavelIcon,
  Group as GroupIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Logging out user:', user._id); // Debug log
      await axios.post('http://localhost:5000/auth/logout', {
        _id: user._id
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local storage and logout user even if server request fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout();
    }
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Auctions', icon: <GavelIcon />, path: '/auctions' },
    { text: 'Players', icon: <GroupIcon />, path: '/players' },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setIsOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Ghanta PL Auction
          </Typography>
          <Chip
            avatar={<Avatar>{user.emoji}</Avatar>}
            label={user.name}
            onDelete={handleLogout}
            deleteIcon={<LogoutIcon />}
            variant="outlined"
            sx={{ 
              color: 'inherit',
              '& .MuiChip-deleteIcon': {
                color: 'inherit',
              },
            }}
          />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} onClick={() => setIsOpen(false)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
