const connectedUsers = new Map();
let io = null;

const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};
const getSocketServerInstance = () => {
  return io;
};
const addNewConnectedUser = ({ socketId, userId }) => {
  connectedUsers.set(socketId, { userId });
  console.log("Connected Users Map:", connectedUsers);
};

const removeConnectedUser = (socketId) => {
  if (!connectedUsers.has(socketId)) {
    console.log("Socket ID not found in connected users:", socketId);
    return;
  }
  connectedUsers.delete(socketId);
  console.log("Connected Users Map after removal:", connectedUsers);
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
  // Return array of unique userIds currently connected
  const userIds = [];
  connectedUsers.forEach(({ userId }) => {
    if (!userIds.includes(userId)) {
      userIds.push(userId);
    }
  });
  return userIds;
};

module.exports = {
  addNewConnectedUser,
  removeConnectedUser,
  getActiveConnections,
  setSocketServerInstance,
  getSocketServerInstance,
  getOnlineUsers,
};
