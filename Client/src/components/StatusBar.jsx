import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { io } from 'socket.io-client';

const StatusBar = () => {
  const [status, setStatus] = useState({
    server: false,
    mongodb: false,
    onlineUsers: 0
  });

  useEffect(() => {
    const socket = io('http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user'));

    socket.on('connect', () => {
      console.log('Connected to server');
      if (user?._id) {
        socket.emit('userConnected', user._id);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setStatus(prev => ({ ...prev, server: false }));
    });

    socket.on('serverStatus', (newStatus) => {
      console.log('Server status update:', newStatus);
      setStatus(newStatus);
    });

    // Cleanup on unmount
    return () => {
      if (user?._id) {
        socket.emit('userDisconnected', user._id);
      }
      socket.disconnect();
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
        transition: 'transform 0.3s ease-in-out',
        transform: 'translateY(calc(100% - 24px))',
        '&:hover': {
          transform: 'translateY(0)',
        },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          bgcolor: (theme) => theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 2 }}>
          <Chip
            label={`Server ${status.server ? 'Connected' : 'Disconnected'}`}
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
        </Box>
        <Typography variant="body2" sx={{ mr: 2 }}>
          Online Users: {status.onlineUsers}
        </Typography>
      </Paper>
    </Box>
  );
};

export default StatusBar;
