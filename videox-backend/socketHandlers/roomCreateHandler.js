const serverStore = require("../serverStore");
const updateRooms = require("./updates/rooms");
const User = require("../models/user");


const roomCreateHandler = async (socket, data) => {
  
  const { peerId } = data || {};
  
  const socketId = socket.id;
  const userId = socket.user.userId;
  
  let username = "?";
  try {
    const user = await User.findById(userId).select("username");
    if (user && user.username) username = user.username;
  } catch (e) {
    console.error("Could not fetch username for room creator", e);
  }
  
  const roomDetails = serverStore.addNewActiveRoom(userId, socketId, username);
  if (roomDetails && roomDetails.participants && roomDetails.participants[0]) {
    roomDetails.participants[0].peerId = peerId;
  }

  socket.emit("room-create-success", { roomDetails });
  
  roomDetails.participants.forEach((p) => {
    socket.to(p.socketId).emit("room-details-updated", { roomDetails });
  });
  socket.emit("room-details-updated", { roomDetails });
  
  updateRooms();
};

const newRoomCreated = (data) => {
  const { roomDetails } = data;
  store.dispatch(setRoomDetails(roomDetails));
};

module.exports = { newRoomCreated, roomCreateHandler };
