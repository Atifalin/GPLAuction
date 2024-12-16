import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { socket } from '../socket';

const StatusBar = () => {
  const [status, setStatus] = useState({
    server: socket.connected,
    mongodb: false,
    onlineUsers: 0
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    // Initial connection status
    setStatus(prev => ({ ...prev, server: socket.connected }));

    const handleConnect = () => {
      console.log('Connected to server');
      setStatus(prev => ({ ...prev, server: true }));
      if (user?._id) {
        socket.emit('userConnected', user._id);
      }
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setStatus(prev => ({ ...prev, server: false }));
    };

    const handleServerStatus = (newStatus) => {
      console.log('Server status update:', newStatus);
      setStatus(newStatus);
    };

    // Set up event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('serverStatus', handleServerStatus);

    // Request initial status
    socket.emit('getServerStatus');

    // Cleanup on unmount
    return () => {
      if (user?._id) {
        socket.emit('userDisconnected', user._id);
      }
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('serverStatus', handleServerStatus);
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
