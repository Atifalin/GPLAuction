const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const Auction = require('./models/Auction');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Track server status
let serverStatus = {
  server: true,
  mongodb: false,
  onlineUsers: 0
};

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const playersRoutes = require('./routes/players');
const auctionPlayersRoutes = require('./routes/auctionPlayers');
const auctionsRoutes = require('./routes/auctions');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/auction-players', auctionPlayersRoutes);
app.use('/api/auctions', auctionsRoutes);

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

// Auction rooms
const auctionRooms = new Map(); // Maps auctionId to set of participant socket IDs

// Function to broadcast server status
const broadcastServerStatus = () => {
  serverStatus.onlineUsers = onlineUsers.size;
  io.emit('serverStatus', serverStatus);
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send initial server status
  socket.on('getServerStatus', () => {
    socket.emit('serverStatus', serverStatus);
  });

  socket.on('userLoggedIn', async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.isLoggedIn = true;
        await user.save();
        onlineUsers.set(userId, socket.id);
        userSockets.set(socket.id, userId);
        broadcastServerStatus();
      }
    } catch (error) {
      console.error('Error in userLoggedIn:', error);
    }
  });

  socket.on('userLoggedOut', async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.isLoggedIn = false;
        await user.save();
        onlineUsers.delete(userId);
        userSockets.delete(socket.id);
        broadcastServerStatus();
      }
    } catch (error) {
      console.error('Error in userLoggedOut:', error);
    }
  });

  // Auction events
  socket.on('joinAuctionRoom', (auctionId) => {
    socket.join(`auction:${auctionId}`);
    if (!auctionRooms.has(auctionId)) {
      auctionRooms.set(auctionId, new Set());
    }
    auctionRooms.get(auctionId).add(socket.id);
    io.to(`auction:${auctionId}`).emit('participantUpdate', {
      auctionId,
      participants: Array.from(auctionRooms.get(auctionId))
    });
  });

  socket.on('leaveAuctionRoom', (auctionId) => {
    socket.leave(`auction:${auctionId}`);
    if (auctionRooms.has(auctionId)) {
      auctionRooms.get(auctionId).delete(socket.id);
      if (auctionRooms.get(auctionId).size === 0) {
        auctionRooms.delete(auctionId);
      } else {
        io.to(`auction:${auctionId}`).emit('participantUpdate', {
          auctionId,
          participants: Array.from(auctionRooms.get(auctionId))
        });
      }
    }
  });

  socket.on('auctionStateChange', async (data) => {
    const { auctionId, state, userId } = data;
    try {
      const auction = await Auction.findById(auctionId);
      if (auction && auction.host.userId === userId) {
        io.to(`auction:${auctionId}`).emit('auctionStateUpdate', {
          auctionId,
          state
        });
      }
    } catch (error) {
      console.error('Error in auctionStateChange:', error);
    }
  });

  socket.on('auctionDeleted', async (data) => {
    const { auctionId, userId } = data;
    try {
      const auction = await Auction.findById(auctionId);
      if (auction && auction.host.userId === userId) {
        // Notify all clients about the deletion
        io.emit('auctionDeleted', { auctionId });
        
        // Clean up the auction room
        if (auctionRooms.has(auctionId)) {
          const room = `auction:${auctionId}`;
          const sockets = await io.in(room).allSockets();
          sockets.forEach(socketId => {
            io.sockets.sockets.get(socketId)?.leave(room);
          });
          auctionRooms.delete(auctionId);
        }
      }
    } catch (error) {
      console.error('Error in auctionDeleted:', error);
    }
  });

  socket.on('disconnect', () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      userSockets.delete(socket.id);
      broadcastServerStatus();
    }

    // Remove from auction rooms
    auctionRooms.forEach((participants, auctionId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        if (participants.size === 0) {
          auctionRooms.delete(auctionId);
        } else {
          io.to(`auction:${auctionId}`).emit('participantUpdate', {
            auctionId,
            participants: Array.from(participants)
          });
        }
      }
    });
  });
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/GhantaPLAuction', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  serverStatus.mongodb = true;
  if (io) broadcastServerStatus();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  serverStatus.mongodb = false;
  if (io) broadcastServerStatus();
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
  serverStatus.mongodb = false;
  if (io) broadcastServerStatus();
});

mongoose.connection.on('connected', () => {
  console.log('Reconnected to MongoDB');
  serverStatus.mongodb = true;
  if (io) broadcastServerStatus();
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeUsers();
});
