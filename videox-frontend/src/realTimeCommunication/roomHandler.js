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
        // Please do not set isUserInRoom true here. User must explicitly join their own room after creation.
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

  socket.emit("room-leave", { roomId });
  socket.once("room-leave-success", (data) => {
    store.dispatch(setRoomDetails(null));
    store.dispatch(setOpenRoom(false, false));
  });
  socket.once("room-leave-failed", (data) => {
    console.log("[FRONTEND] room-leave-failed received", data);
    alert(data.message || "Failed to leave room");
  });
};
