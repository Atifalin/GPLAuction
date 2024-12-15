# Ghanta PL Auction System

A real-time football player auction system built with React, Node.js, and MongoDB.

## 🌟 Features

### Authentication System
- **Predefined Users**: Four fixed users (ATIF, SAQIB, AQIB, WASIF)
- **Simple Authentication**: Uses 4-digit PIN (default: '0000')
- **JWT-based**: Tokens for session management
- **Real-time Status**: Shows currently logged-in users
- **User Cards**: Visual cards with emojis for each user

### User Management
- **User States**:
  - Online/Offline status tracking
  - Persistent host identification
  - Squad management
  - Main XI selection

### Player System
- **Player Pool**: 1000 players total
  - 20+ Goalkeepers
  - 200+ Defenders
  - 400+ Midfielders
  - ~380 Attackers

### Player Categories
- **Tiers and Minimum Bids**:
  - Bronze: 10 Ghanta Coins (GC)
  - Silver: 25 GC
  - Gold: 50 GC
  - Elite: 75 GC

### Auction System
- **Auction States**:
  - Pending (Created but not started)
  - Active (In progress)
  - Completed (Finished)

- **Host Controls**:
  - Start Auction
  - Pause/Resume Auction
  - End Auction
  - Delete Auction (Pending only)
  - Next Player

- **User Controls**:
  - Join Auction
  - View Auction
  - Place Bids

### Statistics Tracking
- **User Stats**:
  - Total auctions participated
  - Average coins spent
  - Biggest bid made
  - Most frequently bought players

- **Auction Stats**:
  - Time elapsed
  - Winning bids
  - Player ownership

## 🛠 Technical Stack

### Frontend
- React with Vite
- Material-UI (MUI)
- Socket.io Client
- Axios for HTTP requests
- JWT for authentication

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.io for real-time updates
- JWT for authentication

### Real-time Features
- Server status monitoring
- MongoDB connection status
- Connected clients count
- Auto-hiding status bar

## 📁 Project Structure

```
GhantaPLAuction/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── StatusBar.jsx
│   │   ├── App.jsx        # Main application component
│   │   └── socket.js      # Socket.io client setup
│   └── package.json
│
├── server/                 # Backend Node.js application
│   ├── config/
│   │   └── users.js       # Predefined users configuration
│   ├── models/
│   │   ├── User.js        # User model schema
│   │   ├── Player.js      # Player model schema
│   │   └── Auction.js     # Auction model schema
│   ├── routes/
│   │   └── auth.js        # Authentication routes
│   └── index.js           # Main server file
│
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GhantaPLAuction
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create a .env file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/ghantapl
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

### Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the server:
```bash
cd server
npm run dev
```

3. Start the client:
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Default Login Credentials

All users have the same default PIN: `0000`

Available users:
- ATIF (🦁)
- SAQIB (🐯)
- AQIB (🦊)
- WASIF (🐺)

## 📝 Development Notes

### Authentication Flow
1. Users are pre-created on server start
2. Login requires user selection and PIN entry
3. JWT token is generated on successful login
4. Token is stored in localStorage
5. Logout updates server state and clears localStorage

### Real-time Updates
- Socket.io handles server status updates
- Connected clients are tracked
- MongoDB connection status is monitored
- Status bar auto-hides after 5 seconds

### Error Handling
- Duplicate login prevention
- Invalid PIN handling
- Server connection error handling
- MongoDB connection error handling

## 🤝 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
