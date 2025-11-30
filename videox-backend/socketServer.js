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

    socket.on("get-active-rooms", () => {
      console.log(
        `[SOCKET] get-active-rooms request from user: ${socket.user.userId}`
      );
      const updateRooms = require("./socketHandlers/updates/rooms");
      updateRooms(socket.id, socket.user.userId);
    });

    // WebRTC signaling: relay SDP offers, answers, and ICE candidates over Socket.IO
    socket.on("webrtc-offer", (data) => {
      const { to, from, offer, roomId } = data;
      console.log(`[WebRTC] Offer from ${from} to ${to}`);
      io.to(to).emit("webrtc-offer", { from, offer, roomId });
    });

    socket.on("webrtc-answer", (data) => {
      const { to, from, answer, roomId } = data;
      console.log(`[WebRTC] Answer from ${from} to ${to}`);
      io.to(to).emit("webrtc-answer", { from, answer, roomId });
    });

    socket.on("webrtc-ice-candidate", (data) => {
      const { to, from, candidate, roomId } = data;
      io.to(to).emit("webrtc-ice-candidate", { from, candidate, roomId });
    });

    // Peer presence: frontend emits when PeerJS connection opens so we can
    // mark the participant as having an active peerId and broadcast to room.
    socket.on("peer-presence", (data) => {
      console.log(
        "[BACKEND] 📡 Received peer-presence from socket:",
        socket.id,
        "data:",
        data
      );
      const { roomId, peerId, isAudioEnabled, isVideoEnabled } = data || {};
      if (!roomId) {
        console.log("[BACKEND] ❌ No roomId in peer-presence");
        return;
      }

      // Debug: Show all available rooms
      const availableRooms = serverStore.activeRooms || [];
      console.log("[BACKEND] 🔍 Looking for room:", roomId);
      console.log(
        "[BACKEND] 🔍 Available rooms:",
        availableRooms.map((r) => ({
          roomId: r.roomId,
          participantCount: r.participants.length,
        }))
      );

      let room = availableRooms.find((r) => r.roomId === roomId);
      if (!room) {
        console.log("[BACKEND] ❌ Room not found:", roomId);
        console.log(
          "[BACKEND] 🔍 All room IDs:",
          availableRooms.map((r) => r.roomId)
        );
        return;
      }

      // Find participant by socketId first, then by peerId, then by userId
      let participant = room.participants.find((p) => p.socketId === socket.id);
      if (!participant) {
        participant = room.participants.find((p) => p.peerId === peerId);
      }
      if (!participant) {
        // As a last resort, try matching by the authenticated user id
        participant = room.participants.find(
          (p) => p.userId === socket.user.userId
        );
      }
      if (!participant) {
        console.log(
          "[BACKEND] ❌ Participant not found for socket:",
          socket.id,
          "or peer:",
          peerId,
          "or user:",
          socket.user?.userId
        );
        console.log(
          "[BACKEND] 🔍 Available participants:",
          room.participants.map((p) => ({
            socketId: p.socketId,
            peerId: p.peerId,
            userId: p.userId,
            username: p.username,
          }))
        );
        return;
      }

      console.log(
        "[BACKEND] 🔍 Found participant:",
        participant.username,
        "socket:",
        participant.socketId
      );
      participant.peerId = peerId;

      // Update audio/video enabled state
      const oldAudio = participant.isAudioEnabled;
      const oldVideo = participant.isVideoEnabled;

      if (typeof isAudioEnabled !== "undefined") {
        participant.isAudioEnabled = isAudioEnabled;
      }
      if (typeof isVideoEnabled !== "undefined") {
        participant.isVideoEnabled = isVideoEnabled;
      }

      console.log(
        "[BACKEND] 🎯 State change for",
        participant.username,
        "- Audio:",
        oldAudio,
        "→",
        participant.isAudioEnabled,
        "Video:",
        oldVideo,
        "→",
        participant.isVideoEnabled
      );

      // Notify other participants about this peer presence
      console.log(
        "[BACKEND] 📤 Broadcasting to",
        room.participants.length - 1,
        "other participants"
      );
      room.participants.forEach((p) => {
        if (p.socketId !== socket.id) {
          // Don't send to self
          try {
            console.log(
              "[BACKEND] 📤 Broadcasting to",
              p.username,
              "(socket:",
              p.socketId,
              ") about",
              participant.username,
              "state change"
            );
            socket.to(p.socketId).emit("room-peer-presence", {
              userId: participant.userId,
              peerId,
              isAudioEnabled: participant.isAudioEnabled,
              isVideoEnabled: participant.isVideoEnabled,
            });
          } catch (e) {
            console.log(
              "[BACKEND] ❌ Error broadcasting to",
              p.socketId,
              ":",
              e
            );
          }
        }
      });

      // Also update room-details for UIs
      room.participants.forEach((p) => {
        try {
          socket
            .to(p.socketId)
            .emit("room-details-updated", { roomDetails: room });
        } catch (e) {}
      });
    });

    socket.on("peer-absent", (data) => {
      const { roomId, peerId } = data || {};
      // If roomId not provided, try to find the room by this socket id
      let room = null;
      if (roomId) {
        room = (serverStore.activeRooms || []).find((r) => r.roomId === roomId);
      } else {
        room = (serverStore.activeRooms || []).find((r) =>
          r.participants.some((p) => p.socketId === socket.id)
        );
      }
      if (!room) return;
      let participant = room.participants.find(
        (p) =>
          p.peerId === peerId ||
          p.socketId === socket.id ||
          p.userId === socket.user.userId
      );
      if (!participant) return;
      participant.peerId = null;

      room.participants.forEach((p) => {
        try {
          socket
            .to(p.socketId)
            .emit("room-peer-absent", {
              userId: participant.userId,
              peerId: null,
            });
        } catch (e) {}
      });

      room.participants.forEach((p) => {
        try {
          socket
            .to(p.socketId)
            .emit("room-details-updated", { roomDetails: room });
        } catch (e) {}
      });
    });

    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });
  });
};

module.exports = { registerSocketServer };
