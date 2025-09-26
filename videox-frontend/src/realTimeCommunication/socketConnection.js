import { io } from "socket.io-client";
import { setPendingInvitations, setFriends } from "../actions/friendsActions";
import { updateDirectChatHistoryIfActive } from "../shared/utilities/chat";
import store from "../store/store";

// Create audio element for TING sound
const tingAudio = typeof window !== "undefined" ? new Audio("/ting.mp3") : null;
let socket = null;

// Track whether we're loading chat history (should not play TING)
let isLoadingChatHistory = false;

export const connectWithSocketServer = (userDetails) => {
  if (!userDetails?.token) {
    console.error("JWT token is missing");
    return;
  }

  // Only create a new socket if one doesn't exist or is disconnected
  if (!socket || !socket.connected) {
    socket = io("http://localhost:5002", {
      auth: {
        token: userDetails.token,
      },
      transports: ["websocket", "polling"], // ensure websocket transport first
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

    // Set up event listeners after socket is initialized
    socket.on("online-users", (data) => {
      const { onlineUsers } = data;
      console.log("[SOCKET] Received online-users:", onlineUsers);
      store.dispatch({ type: "FRIENDS.SET_ONLINE_USERS", onlineUsers });
    });

    socket.on("direct-chat-history", (data) => {
      updateDirectChatHistoryIfActive(data);
      // Play TING sound only for new messages (not when loading chat history)
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
      // Reset the flag after processing
      isLoadingChatHistory = false;
    });

    socket.on("message-edited", (data) => {
      console.log("[SOCKET] Message edited:", data);
      updateDirectChatHistoryIfActive(data);
    });

    socket.on("message-deleted", (data) => {
      console.log("[SOCKET] Message deleted:", data);
      updateDirectChatHistoryIfActive(data);
    });
    return socket;
  }
};

export const sendDirectMessage = (data) => {
  console.log("Sending direct message:", data);
  socket.emit("direct-message", data);
};

export const getDirectChatHistory = (data) => {
  console.log("Sending direct chat history request:", data);
  // Set flag to indicate we're loading chat history (should not play TING)
  isLoadingChatHistory = true;
  socket.emit("direct-chat-history", data);
};

export const editMessage = (data) => {
  console.log("Editing message:", data);
  socket.emit("edit-message", data);
};

export const deleteMessage = (data) => {
  console.log("Deleting message:", data);
  socket.emit("delete-message", data);
};
