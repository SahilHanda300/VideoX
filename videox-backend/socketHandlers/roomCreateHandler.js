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

  // Join the creator's socket to the room so they receive room broadcasts
  try {
    socket.join(roomDetails.roomId);
  } catch (e) {
    console.warn("Could not join creator socket to room:", e);
  }

  // Emit success to creator
  socket.emit("room-create-success", { roomDetails });

  // Use the server instance to broadcast updated room details to everyone in the room
  try {
    const io = serverStore.getSocketServerInstance();
    if (io) {
      io.to(roomDetails.roomId).emit("room-details-updated", { roomDetails });
    } else {
      // Fallback: emit to known participant socketIds
      roomDetails.participants.forEach((p) => {
        socket.to(p.socketId).emit("room-details-updated", { roomDetails });
      });
      socket.emit("room-details-updated", { roomDetails });
    }
  } catch (e) {
    console.error("Error emitting room details update:", e);
  }

  updateRooms();
};

const newRoomCreated = (data) => {
  const { roomDetails } = data;
  store.dispatch(setRoomDetails(roomDetails));
};

module.exports = { newRoomCreated, roomCreateHandler };
