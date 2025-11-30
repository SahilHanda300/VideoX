import { setOpenRoom, setRoomDetails } from "../actions/roomActions";
import store from "../store/store";
import * as socketConnection from "./socketConnection";

import { getPeerInstance, waitForPeerId } from "./peerConnectionManager";

export const createNewRoom = async () => {
  // Only set isUserRoomCreator true, isUserInRoom false on creation
  store.dispatch(setOpenRoom(true, false));
  const socket = socketConnection.getSocket();
  if (!socket || !socket.connected) {
    console.error("Socket not initialized or not connected");
    alert("Unable to create room: not connected to server.");
    return;
  }

  // CRITICAL FIX: Allow peer initialization before attempting to get peer ID
  // We'll use a temporary room ID for creation, the real roomId will come from server
  const { allowPeerInitialization } = await import("./peerConnectionManager");
  allowPeerInitialization("creating-room-" + Date.now());

  const peerId = await waitForPeerId();
  navigator.mediaDevices
    .getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
      },
    })
    .then((stream) => {
      // localStream is now managed in component state, not Redux
      socket.emit("room-create", { peerId });
      socket.on("room-details-updated", (data) => {
        if (data && data.roomDetails) {
          store.dispatch(setRoomDetails(data.roomDetails));
        }
      });
      socket.once("room-create-success", (data) => {
        store.dispatch(setRoomDetails(data.roomDetails));
        // Auto-join creator so their camera/mic stream is active immediately
        const createdRoomId =
          data?.roomDetails?.roomId || data?.roomDetails?._id;
        if (createdRoomId) {
          socket.emit("room-join", { roomId: createdRoomId, peerId });

          socket.once("room-join-success", (joinData) => {
            store.dispatch(setRoomDetails(joinData.roomDetails));
            store.dispatch(setOpenRoom(false, true));
          });

          socket.once("room-join-failed", (joinErr) => {
            console.warn("Auto-join failed:", joinErr);
            alert(joinErr?.message || "Failed to auto-join created room");
          });
        }
      });
      socket.once("room-create-failed", (data) => {
        alert(data.message || "Failed to create room");
      });
    })
    .catch((err) => {
      alert("Could not access camera/microphone: " + err.message);
    });
};

export const joinRoom = async (roomId) => {
  const socket = socketConnection.getSocket();
  if (!socket || !socket.connected) {
    alert("Unable to join room: not connected to server.");
    return;
  }

  // CRITICAL FIX: Allow peer initialization before attempting to get peer ID
  const { allowPeerInitialization } = await import("./peerConnectionManager");
  allowPeerInitialization(roomId);

  const peerId = await waitForPeerId();
  navigator.mediaDevices
    .getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
      },
    })
    .then((stream) => {
      // localStream is now managed in component state, not Redux
      socket.emit("room-join", { roomId, peerId });
      socket.on("room-details-updated", (data) => {
        if (data && data.roomDetails) {
          store.dispatch(setRoomDetails(data.roomDetails));
        }
      });
      socket.once("room-join-success", (data) => {
        store.dispatch(setRoomDetails(data.roomDetails));
        store.dispatch(setOpenRoom(false, true));
      });
      socket.once("room-join-failed", (data) => {
        alert(data.message || "Failed to join room");
      });
    })
    .catch((err) => {
      alert("Could not access camera/microphone: " + err.message);
    });
};

export const leaveRoom = (roomId) => {
  const socket = socketConnection.getSocket();
  if (!socket || !socket.connected) {
    console.error("[FRONTEND] Socket not initialized or not connected");
    alert("Unable to leave room: not connected to server.");
    return;
  }

  console.log(`[roomHandler] 🚪 Leaving room: ${roomId}`);

  // IMMEDIATE room disposal and cleanup for the leaving user
  try {
    // Clear room details and set user as not in room
    store.dispatch(setRoomDetails(null));
    store.dispatch(setOpenRoom(false, false));

    // Reset room-related state
    store.dispatch({ type: "ROOM.RESET_ROOM_STATE" });

    // Also remove this room from active rooms list locally (immediate effect)
    store.dispatch({ type: "ROOM.REMOVE_ROOM_FROM_ACTIVE", roomId });

    console.log(
      "[roomHandler] ✅ Room disposed locally and removed from active list"
    );
  } catch (e) {
    console.warn("Could not update local store on leave:", e);
  }

  // Notify server of room leave
  socket.emit("room-leave", { roomId });

  // Handle server responses and refresh active rooms list
  socket.once("room-leave-success", (data) => {
    console.log("[roomHandler] 📤 Server confirmed room leave:", data);

    // Request updated active rooms list to ensure room visibility is correct
    socket.emit("get-active-rooms");
    console.log("[roomHandler] 🔄 Requested updated active rooms list");
  });

  socket.once("room-leave-failed", (data) => {
    console.warn("[roomHandler] ❌ Server reported leave failure:", data);
    // Don't restore room state - user already left locally
    // This prevents the room from reappearing if server has issues

    // Still request updated rooms list in case of partial success
    socket.emit("get-active-rooms");
  });

  // Also immediately request updated active rooms (don't wait for server response)
  setTimeout(() => {
    socket.emit("get-active-rooms");
    console.log("[roomHandler] ⚡ Immediate active rooms refresh requested");
  }, 100);
};
