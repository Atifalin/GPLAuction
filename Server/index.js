const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const predefinedUsers = require('./config/users');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Initialize users function
async function initializeUsers() {
  try {
    // First, remove all existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create all predefined users
    const users = await User.insertMany(
      predefinedUsers.map(user => ({
        _id: user.userId,
        ...user,
        isLoggedIn: false
      }))
    );

    console.log('Created users:', users);
    return users;
  } catch (error) {
    console.error('Error initializing users:', error);
    throw error;
  }
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ghantapl')
  .then(async () => {
    console.log('Connected to MongoDB');
    mongodbConnected = true;
    
    // Initialize users
    await initializeUsers();
    
    broadcastStatus();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    mongodbConnected = false;
    broadcastStatus();
  });

// Track MongoDB connection status
let mongodbConnected = false;
mongoose.connection.on('connected', () => {
  mongodbConnected = true;
  broadcastStatus();
});

mongoose.connection.on('disconnected', () => {
  mongodbConnected = false;
  broadcastStatus();
});

// Basic server setup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

// Track connected clients
let connectedClients = 0;

// Broadcast status to all connected clients
function broadcastStatus() {
  io.emit('serverStatus', {
    server: true,
    mongodb: mongodbConnected,
    connectedClients
  });
}

io.on('connection', (socket) => {
  console.log('New client connected');
  connectedClients++;
  broadcastStatus();
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    connectedClients--;
    broadcastStatus();
  });

  socket.on('getStatus', () => {
    socket.emit('serverStatus', {
      server: true,
      mongodb: mongodbConnected,
      connectedClients
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
