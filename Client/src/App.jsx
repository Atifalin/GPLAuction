import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme, Box } from '@mui/material';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import StatusBar from './components/StatusBar';
import Players from './pages/Players';
import Home from './pages/Home';
import api from './api/axios';
import io from 'socket.io-client';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  const theme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      primary: {
        main: '#90caf9',
      },
    },
  });

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      const socket = io('http://localhost:5000');
      socket.on('connect', () => {
        socket.emit('userConnected', user._id);
      });
      
      return () => {
        socket.emit('userDisconnected', user._id);
        socket.disconnect();
      };
    }
  }, [user]);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      if (user?._id) {
        await api.post('/auth/logout', { userId: user._id });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {user && <Navbar user={user} onLogout={handleLogout} />}
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: user ? 8 : 0 }}>
            <Routes>
              <Route 
                path="/login" 
                element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/players"
                element={
                  <ProtectedRoute>
                    <Players />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
            </Routes>
          </Box>
          {user && <StatusBar />}
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
