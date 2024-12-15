import React, { useState, useEffect } from 'react';
import { Box, Slide, IconButton, Typography, Stack, Chip } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { socket } from '../socket';

const StatusBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [status, setStatus] = useState({
    server: false,
    mongodb: false,
    connectedClients: 0
  });

  // Auto-hide timer
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, status]);

  // Socket listeners
  useEffect(() => {
    const handleStatus = (newStatus) => {
      setStatus(prev => ({ ...prev, ...newStatus }));
      setIsVisible(true); // Show bar when status changes
    };

    socket.on('serverStatus', handleStatus);
    
    // Initial status check
    socket.emit('getStatus');

    return () => {
      socket.off('serverStatus', handleStatus);
    };
  }, []);

  const getStatusColor = (isActive) => isActive ? 'success' : 'error';

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Slide direction="up" in={isVisible}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid',
            borderColor: 'divider',
            borderBottom: 'none',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 2 }}>
            <Chip
              label={`Server ${status.server ? 'Online' : 'Offline'}`}
              color={getStatusColor(status.server)}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`MongoDB ${status.mongodb ? 'Connected' : 'Disconnected'}`}
              color={getStatusColor(status.mongodb)}
              size="small"
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary">
              Connected Clients: {status.connectedClients}
            </Typography>
          </Stack>
          <IconButton 
            size="small" 
            onClick={() => setIsVisible(!isVisible)}
            sx={{ mr: 1 }}
          >
            {isVisible ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
          </IconButton>
        </Box>
      </Slide>
      {!isVisible && (
        <IconButton
          size="small"
          onClick={() => setIsVisible(true)}
          sx={{
            position: 'fixed',
            bottom: 0,
            right: 16,
            bgcolor: 'background.paper',
            boxShadow: 1,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            '&:hover': {
              bgcolor: 'background.paper',
            },
          }}
        >
          <KeyboardArrowUp />
        </IconButton>
      )}
    </Box>
  );
};

export default StatusBar;
