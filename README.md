# Ghanta PL Auction System

A real-time football player auction system built with React, Node.js, and MongoDB.

## 🌟 Features

### Authentication System
- **Predefined Users**: Four fixed users (ATIF, SAQIB, AQIB, WASIF)
- **Simple Authentication**: Uses 4-digit PIN (default: '0000')
- **JWT-based**: Tokens for session management
- **Real-time Status**: Shows currently logged-in users
- **User Cards**: Visual cards with emojis for each user
- **Smart Navigation**: Automatic redirect to home page after login

### Navigation & UI
- **Modern App Bar**: Easy access to all features
- **Responsive Design**: Works on all screen sizes
- **Dark Theme**: Easy on the eyes
- **Real-time Status Bar**: Shows server connection status
- **User Info Display**: Shows current user's emoji and name
- **Quick Actions**: Easy access to logout

### Player Database
- **Comprehensive Pool**: 1000 players total
  - 20+ Goalkeepers
  - 200+ Defenders
  - 400+ Midfielders
  - ~380 Attackers
- **Advanced Search**: Filter by name, position, and tier
- **Player Cards**: Detailed player information including:
  - Name and Position
  - Club and Nationality
  - Overall Rating
  - Tier Classification
  - Minimum Bid Value

### Player Categories
- **Tier System**:
  - Bronze: 10 Ghanta Coins (GC) minimum bid
  - Silver: 25 GC minimum bid
  - Gold: 50 GC minimum bid
  - Elite: 75 GC minimum bid
- **Position Groups**:
  - Goalkeepers (GK)
  - Defenders (RB, LB, CB, RWB, LWB, RCB, LCB)
  - Midfielders (CDM, CM, CAM, RM, LM, RDM, LDM, RCM, LCM)
  - Attackers (RW, LW, ST, CF, RF, LF, RS, LS)

### Auction Player Selection
- **Smart Default Selection**:
  - 10 Goalkeepers
  - 30 Defenders
  - 30 Midfielders
  - 30 Attackers
  - Guaranteed minimum of 5 players from each tier
- **Custom Selection**:
  - Add/Remove individual players
  - Reset to default selection
  - View currently selected players
- **Selection Management**:
  - Prevents duplicate selections
  - Real-time updates
  - Clear feedback on actions

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

### Squad Management
- **Main XI**: Select and manage your top 11 players
- **Full Squad**: View all players won in auctions
- **Stats Tracking**:
  - Total auctions participated
  - Average coins spent
  - Biggest bid made
  - Most frequently bought players

### Real-time Features
- **Live Updates**:
  - Server connection status
  - User online/offline status
  - Auction state changes
  - Bid updates
- **Socket Integration**: Instant updates without page refresh
- **Error Handling**: Clear feedback on connection issues

### Recent Updates

#### December 15, 2023
- **Enhanced Auction Management**:
  - Added validation requiring 50+ selected players to create an auction
  - Improved auction deletion with instant notifications
  - Added real-time list refresh after auction actions
  - Fixed UI synchronization issues with socket events
  - Better error handling for auction operations

- **User Experience Improvements**:
  - Added automatic redirect to player selection when needed
  - Added success notifications for auction creation/deletion
  - Streamlined socket event handling for better performance
  - Improved state management for auction list updates
  - Enhanced button states based on auction participation

- **Validation and Safety**:
  - Minimum 50 players required before auction creation
  - Join button changes to View after joining auction
  - Proper error messages with guided navigation
  - Real-time participant count updates

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
