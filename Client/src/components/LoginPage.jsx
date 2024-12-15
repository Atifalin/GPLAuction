import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import api from '../api/axios';
import io from 'socket.io-client';

const LoginPage = ({ onLogin }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pinValue, setPinValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to login page socket');
    });

    socket.on('serverStatus', (status) => {
      setServerStatus(status);
    });

    socket.on('loginError', (error) => {
      setError(error);
      setPinValue('');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await api.get('/auth/users');
      console.log('Users response:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!selectedUser || !pinValue) {
        setError('Please select a user and enter PIN');
        setLoading(false);
        return;
      }

      const response = await api.post('/auth/login', {
        userId: selectedUser._id,
        pin: pinValue
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        onLogin(user);
        window.location.href = '/'; 
      } else {
        setError('Login failed. Please try again.');
        setPinValue('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setPinValue('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setPinValue('');
    setError('');
  };

  const UserCard = ({ user }) => (
    <Card
      sx={{
        cursor: user.isLoggedIn ? 'not-allowed' : 'pointer',
        opacity: user.isLoggedIn ? 0.5 : 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: user.isLoggedIn ? 'none' : 'translateY(-4px)',
          boxShadow: user.isLoggedIn ? 1 : 6,
        },
      }}
      onClick={() => !user.isLoggedIn && setSelectedUser(user)}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Typography variant="h2" component="div" sx={{ mb: 2 }}>
          {user.emoji}
        </Typography>
        <Typography variant="h5" component="div" sx={{ mb: 1 }}>
          {user.name}
        </Typography>
        {user.isLoggedIn && (
          <Typography variant="body2" color="text.secondary">
            Currently Online
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !users.length) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="contained" onClick={fetchUsers}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ mb: 6, color: 'text.primary' }}>
          Ghanta PL Auction
        </Typography>
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          {serverStatus && (
            <Typography variant="body2" color="text.secondary">
              Server Status: {serverStatus.server ? 'Connected' : 'Disconnected'} | 
              Online Users: {serverStatus.onlineUsers}
            </Typography>
          )}
        </Box>
        <Grid container spacing={4} justifyContent="center">
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={3} key={user._id}>
              <UserCard user={user} />
            </Grid>
          ))}
        </Grid>

        <Dialog open={!!selectedUser} onClose={handleClose}>
          <DialogTitle>
            Enter PIN
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              <TextField
                autoFocus
                margin="dense"
                label="PIN"
                type="password"
                fullWidth
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button 
              onClick={handleLogin} 
              variant="contained" 
              disabled={loading || !pinValue}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default LoginPage;
