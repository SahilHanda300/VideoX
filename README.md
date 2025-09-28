# VideoX - The Next Gen Video Conferencing App

VideoX is a modern web application that combines real-time video chat capabilities with text messaging and friend management features. Built with React.js for the frontend and Node.js for the backend, it provides a seamless communication experience on both desktop and mobile devices.

## Features

### Video Chat

- Real-time peer-to-peer video calls
- Mesh network topology for multi-user video conferencing
- Camera and microphone controls
- Room creation and joining functionality

### Messaging

- Real-time text messaging between users
- Message editing and deletion capabilities
- Chat history preservation
- Message notifications with sound alerts

### Friend Management

- Smart friend invitation system with email validation
- Duplicate invitation prevention
- Pending invitation management with intuitive controls
- Online status indicators for friends
- Mobile-friendly invitation interface

### Mobile Experience

- Responsive design for all screen sizes
- Touch-friendly interface
- Intuitive sidebar navigation
- Auto-hiding sidebars on mobile
- Smart interaction patterns for mobile users

### Authentication & Security

- Email and password-based authentication
- JWT token-based session management
- Secure API endpoints
- Protected routes
- Form validation with error messages

## Technical Stack

### Frontend

- **React.js** - User interface and component management
- **Redux** - State management
- **Material-UI** - UI components and styling
- **Socket.IO Client** - Real-time communication
- **PeerJS** - WebRTC peer-to-peer connections
- **Tailwind CSS** - Utility-first CSS framework

### Backend

- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **MongoDB** - Database
- **Socket.IO** - Real-time event handling
- **JWT** - Authentication
- **Mongoose** - MongoDB object modeling

## Project Structure

### Frontend (`videox-frontend/`)

```
src/
├── actions/         # Redux actions
├── authPages/       # Login and registration
├── Dashboard/       # Main application interface
├── realTimeCommunication/  # Socket and WebRTC
├── shared/          # Reusable components
├── store/          # Redux store and reducers
└── utilities/      # Helper functions
```

### Backend (`videox-backend/`)

```
├── controllers/     # Request handlers
├── middleware/     # Authentication middleware
├── models/         # Database models
├── routes/         # API routes
├── socketHandlers/ # Socket.IO event handlers
└── server.js      # Main server file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/SahilHanda300/VideoX.git
cd VideoX
```

2. Install backend dependencies:

```bash
cd videox-backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../videox-frontend
npm install
```

4. Create a .env file in the backend directory with:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5002
```

### Running the Application

1. Start the backend server:

```bash
cd videox-backend
npm start
```

2. Start the frontend development server:

```bash
cd videox-frontend
npm start
```

The application will be available at `http://localhost:3000`

## Features in Detail

### Video Chat

- Create or join video chat rooms
- Toggle camera and microphone
- Leave and rejoin functionality
- Real-time participant updates

### Messaging

- Real-time private messaging
- Message editing with history tracking
- Message deletion
- Notification sounds for new messages
- Read status indicators

### Friend Management

- Send friend invitations via email
- Accept or reject friend requests
- View online status of friends
- Remove friends

## Security Features

- Password hashing
- JWT token validation
- Protected API endpoints
- Secure WebSocket connections

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

## Acknowledgments

- Material-UI for the component library
- Socket.IO for real-time capabilities
- PeerJS for WebRTC implementation
- Tailwind CSS for utility classes
