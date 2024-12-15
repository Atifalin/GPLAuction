import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme, Box } from '@mui/material';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import StatusBar from './components/StatusBar';
import Players from './pages/Players';
import Home from './pages/Home';
import AuctionPlayerSelection from './pages/AuctionPlayerSelection';
import api from './api/axios';
import io from 'socket.io-client';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server socket');
    });

    newSocket.on('serverStatus', (status) => {
      setServerStatus(status);
    });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (socket) {
      socket.emit('userLoggedIn', userData._id);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', { userId: user._id });
      localStorage.removeItem('user');
      setUser(null);
      if (socket) {
        socket.emit('userLoggedOut', user._id);
      }
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <StatusBar serverStatus={serverStatus} />
          {user && <Navbar user={user} onLogout={handleLogout} />}
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: user ? 8 : 0 }}>
            <Routes>
              <Route path="/login" element={
                user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Box sx={{ mt: 8, mb: 2 }}>
                    <Home user={user} />
                  </Box>
                </ProtectedRoute>
              } />
              <Route path="/players" element={
                <ProtectedRoute>
                  <Box sx={{ mt: 8, mb: 2 }}>
                    <Players />
                  </Box>
                </ProtectedRoute>
              } />
              <Route path="/auction-selection" element={
                <ProtectedRoute>
                  <Box sx={{ mt: 8, mb: 2 }}>
                    <AuctionPlayerSelection />
                  </Box>
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
