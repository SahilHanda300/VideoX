import Peer from "peerjs";

let peerInstance = null;
let peerId = null;
let openPromise = null;

export function getPeerInstance() {
  if (!peerInstance) {
    peerInstance = new Peer({
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
      },
      debug: 3, // Log everything
    });

    openPromise = new Promise((resolve) => {
      peerInstance.on("open", (id) => {
        console.log("[PeerJS] Connection opened with ID:", id);
        peerId = id;
        resolve(id);
      });

      peerInstance.on("error", (error) => {
        console.error("[PeerJS] Connection error:", error);
      });
    });
  }
  return peerInstance;
}

export function getPeerId() {
  return peerId;
}

export async function waitForPeerId() {
  if (peerId) return peerId;
  getPeerInstance(); // ensure instance is created
  return openPromise;
}
