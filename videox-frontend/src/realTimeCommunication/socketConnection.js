import { io } from "socket.io-client";
import { setPendingInvitations, setFriends } from "../actions/friendsActions";
import store from "../store/store";
let socket = null;

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

    socket.on("online-users", (data) => {
      const { onlineUsers } = data;
      console.log("[SOCKET] Received online-users:", onlineUsers);
      store.dispatch({ type: "FRIENDS.SET_ONLINE_USERS", onlineUsers });
    });

    return socket;
  }
};
