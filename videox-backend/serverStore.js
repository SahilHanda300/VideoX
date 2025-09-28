const { v4: uuidv4 } = require("uuid");
const connectedUsers = new Map();
let io = null;
let activeRooms = [];

const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};
const getSocketServerInstance = () => {
  return io;
};
const addNewConnectedUser = ({ socketId, userId }) => {
  connectedUsers.set(socketId, { userId });
};

const removeConnectedUser = (socketId) => {
  if (!connectedUsers.has(socketId)) {
    return;
  }
  connectedUsers.delete(socketId);
};

const getActiveConnections = (userId) => {
  const activeConnections = [];
  connectedUsers.forEach((value, key) => {
    if (value.userId === userId) {
      activeConnections.push(key);
    }
  });
  return activeConnections;
};

const getOnlineUsers = () => {
  const userIds = [];
  connectedUsers.forEach(({ userId }) => {
    if (!userIds.includes(userId)) {
      userIds.push(userId);
    }
  });
  return userIds;
};

const addNewActiveRoom = (userId, socketId, username) => {
  const newActiveRoom = {
    roomCreator: {
      userId,
      username,
      socketId,
    },
    participants: [
      {
        userId,
        username,
        socketId,
      },
    ],
    roomId: uuidv4(),
  };

  activeRooms = [...activeRooms, newActiveRoom];
  return newActiveRoom;
};
module.exports = {
  addNewConnectedUser,
  removeConnectedUser,
  getActiveConnections,
  setSocketServerInstance,
  getSocketServerInstance,
  getOnlineUsers,
  addNewActiveRoom,
  get activeRooms() {
    return activeRooms;
  },
};
