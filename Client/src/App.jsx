import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, createTheme, Box } from '@mui/material';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import StatusBar from './components/StatusBar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

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
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: "#6b6b6b #2b2b2b",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: "#6b6b6b",
              minHeight: 24,
            },
            "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
              borderRadius: 8,
              backgroundColor: "#2b2b2b",
            },
          },
        },
      },
    },
  });

  const handleLogin = (userData) => {
    console.log('Logging in user:', userData); // Debug log
    setUser(userData);
  };

  const handleLogout = () => {
    console.log('Handling logout'); // Debug log
    setUser(null);
    window.location.reload(); // Force reload to clear any remaining state
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {user ? (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                mt: 8, // Space for AppBar
                bgcolor: 'background.default',
              }}
            >
              {/* Main content will go here */}
            </Box>
          </>
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
        <StatusBar />
      </Box>
    </ThemeProvider>
  );
}

export default App;
