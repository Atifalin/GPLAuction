import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
  Container,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const LoginPage = ({ onLogin }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        _id: selectedUser._id,
        pin
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
      setSelectedUser(null);
      setPin('');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
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
        <Grid container spacing={4} justifyContent="center">
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={3} key={user._id}>
              <UserCard user={user} />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Dialog 
        open={!!selectedUser} 
        onClose={() => setSelectedUser(null)}
        PaperProps={{
          sx: {
            minWidth: { xs: '90%', sm: 400 }
          }
        }}
      >
        <DialogTitle>
          Login as {selectedUser?.name}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setSelectedUser(null)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Enter PIN"
              type="password"
              fullWidth
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              error={!!error}
              helperText={error}
              inputProps={{
                maxLength: 4,
                pattern: '\\d*',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Cancel</Button>
          <Button onClick={handleLogin} variant="contained">
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
