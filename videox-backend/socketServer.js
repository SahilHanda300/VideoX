const { verifyTokenSocket } = require("./middleware/authSocket");
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");
const disconnectHandler = require("./socketHandlers/disconnectHandler");
const serverStore = require("./serverStore");
const directMessageHandler = require("./socketHandlers/directMessageHandler");
const directChatHistoryHandler = require("./socketHandlers/directChatHistoryHandler");
const editMessageHandler = require("./socketHandlers/editMessageHandler");
const deleteMessageHandler = require("./socketHandlers/deleteMessageHandler");
const roomCreateHandler = require("./socketHandlers/roomCreateHandler");

const roomJoinHandler = require("./socketHandlers/roomJoinHandler");
const roomLeaveHandler = require("./socketHandlers/roomLeaveHandler");

const registerSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  serverStore.setSocketServerInstance(io);
  io.use((socket, next) => verifyTokenSocket(socket, next));

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    newConnectionHandler(socket, io);

    socket.on("room-status-update", (data) => {
      const { roomId, peerId, status } = data;
      let room = (serverStore.activeRooms || []).find(
        (r) => r.roomId === roomId
      );
      if (!room) return;
      let participant = room.participants.find((p) => p.peerId === peerId);
      if (participant) {
        Object.assign(participant, status);

        room.participants.forEach((p) => {
          socket
            .to(p.socketId)
            .emit("room-status-updated", { roomId, peerId, status });
        });
      }
    });

    socket.on("direct-message", (data) => {
      directMessageHandler(socket, data);
    });

    socket.on("direct-chat-history", (data) => {
      directChatHistoryHandler(socket, data);
    });

    socket.on("edit-message", (data) => {
      editMessageHandler(socket, data);
    });

    socket.on("delete-message", (data) => {
      deleteMessageHandler(socket, data);
    });

    socket.on("room-create", (data) => {
      roomCreateHandler.roomCreateHandler(socket, data);
    });

    socket.on("room-join", (data) => {
      roomJoinHandler(socket, data);
    });

    socket.on("room-leave", (data) => {
      roomLeaveHandler(socket, data);
    });

    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });
  });
};

module.exports = { registerSocketServer };
