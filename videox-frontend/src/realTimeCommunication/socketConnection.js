import Peer from "peerjs";
import { io } from "socket.io-client";
import { setPendingInvitations, setFriends } from "../actions/friendsActions";
import { updateDirectChatHistoryIfActive } from "../shared/utilities/chat";
import store from "../store/store";


export const sendRoomStatusUpdate = (roomId, peerId, status) => {
  if (socket && roomId && peerId) {
    socket.emit("room-status-update", { roomId, peerId, status });
  }
};

export const listenRoomStatusUpdates = () => {
  if (!socket) return;
  socket.on("room-status-updated", (data) => {

    const { peerId, status } = data; 
    const state = store.getState();
    const roomDetails = state.room.roomDetails;
    if (!roomDetails || !roomDetails.participants) return;
    const updatedParticipants = roomDetails.participants.map((p) =>
      p.peerId === peerId ? { ...p, ...status } : p
    );
    store.dispatch({
      type: "ROOM.SET_ROOM_DETAILS",
      roomDetails: { ...roomDetails, participants: updatedParticipants },
    });
  });
};
export const getSocket = () => socket;


export const createNewRoom = () => {
  if (socket) {
    socket.emit("room-create");
  } else {
    console.error("Socket not initialized");
  }
};


const tingAudio = typeof window !== "undefined" ? new Audio("/ting.mp3") : null;
let socket = null;


let isLoadingChatHistory = false;

export const connectWithSocketServer = (userDetails) => {
  if (!userDetails?.token) {
    console.error("JWT token is missing");
    return;
  }

  if (!socket || !socket.connected) {
    socket = io("http://localhost:5002", {
      auth: {
        token: userDetails.token,
      },
      transports: ["websocket", "polling"], // ensure websocket transport first
    });

    socket.on("room-details-updated", (data) => {
      // data: { roomDetails }
      if (data && data.roomDetails) {
        store.dispatch({
          type: "ROOM.SET_ROOM_DETAILS",
          roomDetails: data.roomDetails,
        });
      }
    });

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from socket server:", reason);
    });

    socket.on("friends-invitations", (data) => {
      const { pendingInvitations } = data;
      console.log("[SOCKET] Received friends-invitations:", pendingInvitations);
      store.dispatch(setPendingInvitations(pendingInvitations));
    });

    socket.on("friends-list", (data) => {
      const { friends } = data;
      console.log("[SOCKET] Received friends-list:", friends);
      store.dispatch(setFriends(friends));
    });


    socket.on("online-users", (data) => {
      const { onlineUsers } = data;
      console.log("[SOCKET] Received online-users:", onlineUsers);
      store.dispatch({ type: "FRIENDS.SET_ONLINE_USERS", onlineUsers });
    });

    socket.on("direct-chat-history", (data) => {
      updateDirectChatHistoryIfActive(data);

      if (
        !isLoadingChatHistory &&
        tingAudio &&
        data.messages &&
        data.messages.length > 0
      ) {
        const latestMessage = data.messages[data.messages.length - 1];
        const currentUserId = store.getState().auth.user?._id;
        if (
          latestMessage &&
          latestMessage.author &&
          latestMessage.author._id !== currentUserId
        ) {
          tingAudio.currentTime = 0;
          tingAudio.play();
        }
      }

      isLoadingChatHistory = false;
    });

    socket.on("message-edited", (data) => {
      updateDirectChatHistoryIfActive(data);
    });

    socket.on("message-deleted", (data) => {
      updateDirectChatHistoryIfActive(data);
    });

    socket.on("active-rooms", (data) => {

      if (data && data.activeRooms) {
        store.dispatch({
          type: "ROOM.SET_ACTIVE_ROOMS",
          activeRooms: data.activeRooms,
        });
      }
    });

    return socket;
  }
};

export const sendDirectMessage = (data) => {
  socket.emit("direct-message", data);
};

export const getDirectChatHistory = (data) => {
  isLoadingChatHistory = true;
  socket.emit("direct-chat-history", data);
};

export const editMessage = (data) => {
  socket.emit("edit-message", data);
};

export const deleteMessage = (data) => {
  socket.emit("delete-message", data);
};

export const sendPeerSignal = (signalData) => {
  if (socket) {
    socket.emit("peer-signal", signalData);
  }
};

export const initiatePeerConnection = ({ roomId, peerId }) => {
  if (socket && roomId && peerId) {
    socket.emit("initiate-peer-connection", { roomId, peerId });
  } else {
    console.error(
      "[SOCKET] Cannot emit initiate-peer-connection: missing socket, roomId, or peerId"
    );
  }
};

export const createPeerConnection = (peerId = undefined, options = {}) => {
  return new Peer(peerId, options);
};
