const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const playersRoutes = require('./routes/players');
const auctionPlayersRoutes = require('./routes/auctionPlayers');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/auction-players', auctionPlayersRoutes);

// Initialize predefined users
const initializeUsers = async () => {
  try {
    await User.deleteMany({});
    console.log('Cleared existing users');

    const users = await User.create([
      {
        _id: 'ATIF',
        name: 'Atif',
        pin: '0000',
        emoji: '🦁',
        isLoggedIn: false,
        mainXI: [],
        squad: [],
        stats: {
          totalAuctions: 0,
          averageCoinsSpent: 0,
          biggestBid: 0,
          frequentlyBoughtPlayers: []
        }
      },
      {
        _id: 'SAQIB',
        name: 'Saqib',
        pin: '0000',
        emoji: '🐯',
        isLoggedIn: false,
        mainXI: [],
        squad: [],
        stats: {
          totalAuctions: 0,
          averageCoinsSpent: 0,
          biggestBid: 0,
          frequentlyBoughtPlayers: []
        }
      },
      {
        _id: 'AQIB',
        name: 'Aqib',
        pin: '0000',
        emoji: '🦊',
        isLoggedIn: false,
        mainXI: [],
        squad: [],
        stats: {
          totalAuctions: 0,
          averageCoinsSpent: 0,
          biggestBid: 0,
          frequentlyBoughtPlayers: []
        }
      },
      {
        _id: 'WASIF',
        name: 'Wasif',
        pin: '0000',
        emoji: '🐺',
        isLoggedIn: false,
        mainXI: [],
        squad: [],
        stats: {
          totalAuctions: 0,
          averageCoinsSpent: 0,
          biggestBid: 0,
          frequentlyBoughtPlayers: []
        }
      }
    ]);

    console.log('Created users:', users);
  } catch (error) {
    console.error('Error initializing users:', error);
  }
};

// Track online users and their socket IDs
const onlineUsers = new Map(); // Maps userID to socket ID
const userSockets = new Map(); // Maps socket ID to userID

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Send initial server status to the new client
  socket.emit('serverStatus', {
    server: true,
    mongodb: mongoose.connection.readyState === 1,
    onlineUsers: onlineUsers.size
  });

  socket.on('userConnected', (userId) => {
    // Check if user is already connected
    if (onlineUsers.has(userId)) {
      // Emit error to the new connection
      socket.emit('loginError', 'User is already logged in');
      return;
    }

    // Add user to tracking maps
    onlineUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);

    // Broadcast updated status to all clients
    io.emit('serverStatus', {
      server: true,
      mongodb: mongoose.connection.readyState === 1,
      onlineUsers: onlineUsers.size
    });
  });

  socket.on('disconnect', () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      userSockets.delete(socket.id);
    }

    // Broadcast updated status
    io.emit('serverStatus', {
      server: true,
      mongodb: mongoose.connection.readyState === 1,
      onlineUsers: onlineUsers.size
    });
  });

  socket.on('userDisconnected', (userId) => {
    if (onlineUsers.has(userId)) {
      onlineUsers.delete(userId);
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        userSockets.delete(socketId);
      }
    }

    // Broadcast updated status
    io.emit('serverStatus', {
      server: true,
      mongodb: mongoose.connection.readyState === 1,
      onlineUsers: onlineUsers.size
    });
  });
});

// MongoDB connection status events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
  io.emit('serverStatus', {
    server: true,
    mongodb: true,
    onlineUsers: onlineUsers.size
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  io.emit('serverStatus', {
    server: true,
    mongodb: false,
    onlineUsers: onlineUsers.size
  });
});

// Connect to MongoDB and start server
mongoose.connect('mongodb://localhost:27017/GhantaPLAuction')
  .then(async () => {
    console.log('Connected to MongoDB');
    await initializeUsers();
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

module.exports = { app, server };
