const serverStore = require("../serverStore");
const updateRooms = require("./updates/rooms");


const roomJoinHandler = async (socket, data) => {
  
  const { roomId, peerId } = data;
  const userId = socket.user.userId;
  const username = socket.user.username || "?";
  const socketId = socket.id;

  
  let room = (serverStore.activeRooms || []).find((r) => r.roomId === roomId);
  if (!room) {
    socket.emit("room-join-failed", { message: "Room not found." });
    return;
  }

  
  let participant = room.participants.find((p) => p.userId === userId);
  if (!participant) {
    
    room.participants.push({ userId, username, socketId, peerId });
  } else {
    
    participant.peerId = peerId;
    participant.socketId = socketId;
  }

  
  socket.join(roomId);

  
  room.participants.forEach((p) => {
    socket.to(p.socketId).emit("room-details-updated", { roomDetails: room });
  });
  socket.emit("room-join-success", { roomDetails: room });

  
  socket
    .to(roomId)
    .emit("room-user-joined", { userId, username, socketId, peerId });

  
  updateRooms();
};

module.exports = roomJoinHandler;
