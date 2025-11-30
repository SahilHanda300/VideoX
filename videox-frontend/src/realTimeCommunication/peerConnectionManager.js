import Peer from "peerjs";

// Global error handler to prevent PeerJS crashes
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes("$416260bce337df90$export$ecd1fc136c422448")
    ) {
      console.warn(
        "[PeerManager] Caught PeerJS error, preventing crash:",
        event.error.message
      );
      event.preventDefault();
      return false;
    }
  });
}

let peerInstance = null;
let peerId = null;
let openPromise = null;
let callHandlers = []; // Store handlers so we can call them when a call arrives
let isCreatingPeer = false;
let lastCreationTime = 0;
let connectionState = "disconnected"; // disconnected, connecting, connected, destroyed
let destroyPromise = null;
let isInitializationAllowed = false; // NEW: Block all peer creation until explicitly allowed
let currentRoomId = null; // Track which room we're initialized for
const CREATION_THROTTLE_MS = 5000; // Prevent creating peers more often than every 5 seconds
const CONNECTION_LOCK_KEY = "__VIDEOX_PEER_LOCK";

export function getPeerInstance() {
  // CRITICAL: Block all peer creation unless explicitly allowed
  if (!isInitializationAllowed) {
    console.log(
      "[PeerManager] Peer creation blocked - initialization not allowed yet"
    );
    return {
      __isDummy: true,
      call: () => ({ on: () => {} }),
      on: () => {},
      destroy: () => {},
      disconnected: false,
    };
  }

  // First check: if we're in the middle of destroying, block creation
  if (destroyPromise) {
    console.warn(
      "[PeerManager] Blocking getPeerInstance during destroy process"
    );
    return {
      __isDummy: true,
      call: () => ({ on: () => {} }),
      on: () => {},
      destroy: () => {},
      disconnected: false,
    };
  }

  // Second check: use existing global instance with state validation
  if (typeof window !== "undefined" && window.__VIDEOX_PEER_INSTANCE) {
    const globalInstance = window.__VIDEOX_PEER_INSTANCE;
    // Validate the instance is still alive and not destroyed
    if (globalInstance && !globalInstance.destroyed && globalInstance.id) {
      if (!peerInstance) {
        console.log(
          "[PeerManager] Reusing existing window peer instance:",
          globalInstance.id
        );
        peerInstance = globalInstance;
        peerId = globalInstance.id;
        connectionState = "connected";
        // If we already have an open id, set a resolved openPromise
        if (peerId && !openPromise) {
          openPromise = Promise.resolve(peerId);
        }
      }
      return peerInstance;
    } else {
      // Clean up invalid global instance
      console.warn("[PeerManager] Found invalid global instance, cleaning up");
      try {
        delete window.__VIDEOX_PEER_INSTANCE;
        delete window.__VIDEOX_PEER_ID;
        delete window[CONNECTION_LOCK_KEY];
      } catch (e) {}
    }
  }

  // Third check: return existing module-level instance with state validation
  if (
    peerInstance &&
    !peerInstance.destroyed &&
    connectionState !== "destroyed"
  ) {
    return peerInstance;
  }

  // Fourth check: enforce browser tab instance limit
  if (typeof window !== "undefined") {
    const existingLock = window[CONNECTION_LOCK_KEY];
    if (existingLock && Date.now() - existingLock < CREATION_THROTTLE_MS) {
      console.warn(
        "[PeerManager] Browser tab lock active, preventing new instance"
      );
      return {
        __isDummy: true,
        call: () => ({ on: () => {} }),
        on: () => {},
        destroy: () => {},
        disconnected: false,
      };
    }
  }

  // Fifth check: throttle creation to prevent rapid loops
  const now = Date.now();
  if (
    isCreatingPeer ||
    connectionState === "connecting" ||
    now - lastCreationTime < CREATION_THROTTLE_MS
  ) {
    console.warn(
      `[PeerManager] Throttling peer creation - state: ${connectionState}, isCreating: ${isCreatingPeer}, lastCreation: ${
        now - lastCreationTime
      }ms ago`
    );
    // Return a dummy object to prevent crashes, but don't actually create a peer
    return {
      __isDummy: true,
      call: () => ({ on: () => {} }),
      on: () => {},
      destroy: () => {},
      disconnected: false,
    };
  }

  // Actual peer creation with enhanced guards and state tracking
  if (!peerInstance || peerInstance.destroyed) {
    console.log(
      "[PeerManager] Creating new peer instance with enhanced tracking"
    );
    isCreatingPeer = true;
    connectionState = "connecting";
    lastCreationTime = now;

    // Set browser tab lock
    if (typeof window !== "undefined") {
      window[CONNECTION_LOCK_KEY] = now;
    }

    try {
      console.log(
        "[PeerManager] Attempting to create peer with config: localhost:9000"
      );
      peerInstance = new Peer({
        host: "localhost",
        port: 9000,
        path: "/",
        secure: false,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
            // Add working TURN servers here if available
          ],
        },
        debug: 1, // Enable debug temporarily to see connection issues
      });
      console.log("[PeerManager] Peer instance created, waiting for events...");

      // Add comprehensive error and status event logging
      peerInstance.on("error", (error) => {
        console.error("[PeerManager] Peer error event:", error);
        console.error("[PeerManager] Error type:", error.type);
        console.error("[PeerManager] Error message:", error.message);
        if (error.message) {
          console.error(
            "[PeerManager] Full error details:",
            JSON.stringify(error, Object.getOwnPropertyNames(error))
          );
        }
      });

      peerInstance.on("disconnected", () => {
        console.warn("[PeerManager] Peer disconnected from server");
        connectionState = "disconnected";
      });

      peerInstance.on("close", () => {
        console.warn("[PeerManager] Peer connection closed");
        connectionState = "destroyed";
      });

      // Add connection status logging
      setTimeout(() => {
        console.log(
          "[PeerManager] Connection status check - ID:",
          peerInstance.id,
          "Destroyed:",
          peerInstance.destroyed,
          "Disconnected:",
          peerInstance.disconnected
        );
      }, 2000);

      // Add global error handler to prevent crashes
      const originalEmitError = peerInstance.emitError;
      if (originalEmitError) {
        peerInstance.emitError = function (type, err) {
          console.warn("[PeerManager] Handled peer error:", type, err);
          // Don't call original emitError to prevent crashes
          // Just log and continue
        };
      }
    } catch (error) {
      console.error("[PeerManager] Failed to create peer instance:", error);
      isCreatingPeer = false;
      connectionState = "disconnected";
      // Clear browser tab lock on error
      if (typeof window !== "undefined") {
        try {
          delete window[CONNECTION_LOCK_KEY];
        } catch (e) {}
      }
      // Return dummy peer instead of throwing
      return {
        __isDummy: true,
        call: () => ({ on: () => {} }),
        on: () => {},
        destroy: () => {},
        disconnected: false,
      };
    }

    // Persist instance to window so HMR/re-runs reuse it
    try {
      if (typeof window !== "undefined") {
        window.__VIDEOX_PEER_INSTANCE = peerInstance;
      }
    } catch (e) {}

    // Set up the global call listener IMMEDIATELY (before any calls can arrive)
    // This listener will be active for the lifetime of the peer instance.
    // Guard against multiple listener registration if this module runs twice.
    if (!peerInstance.__hasGlobalCallListener) {
      peerInstance.on("call", (call) => {
        console.log("[PeerJS] Incoming call from peer:", call.peer);
        // Notify all registered handlers
        callHandlers.forEach((handler) => {
          try {
            handler(call);
          } catch (err) {
            console.warn("[PeerJS] Error in call handler:", err);
          }
        });
      });
      peerInstance.__hasGlobalCallListener = true;
    }

    openPromise = new Promise((resolve, reject) => {
      console.log(
        "[PeerManager] Creating openPromise, current instance.id:",
        peerInstance?.id
      );

      // Check if peer already has an ID (race condition fix)
      if (peerInstance && peerInstance.id) {
        console.log(
          "[PeerManager] Peer already has ID, resolving immediately:",
          peerInstance.id
        );
        peerId = peerInstance.id;
        connectionState = "connected";
        resolve(peerInstance.id);
        return;
      }

      // Wrap all event handlers in try-catch to prevent crashes
      const safeOn = (event, handler) => {
        peerInstance.on(event, (...args) => {
          try {
            handler(...args);
          } catch (error) {
            console.error(`[PeerManager] Error in ${event} handler:`, error);
          }
        });
      };

      safeOn("open", (id) => {
        console.log("[PeerManager] Open event fired with ID:", id);
        console.log("[PeerManager] Setting peerId variable to:", id);
        peerId = id;
        isCreatingPeer = false; // Clear creation flag on success
        connectionState = "connected";
        try {
          if (typeof window !== "undefined") {
            window.__VIDEOX_PEER_ID = id;
            // Keep the lock for a bit longer to prevent immediate re-creation
            setTimeout(() => {
              try {
                delete window[CONNECTION_LOCK_KEY];
              } catch (e) {}
            }, 1000);
          }
        } catch (e) {}
        console.log("[PeerManager] About to resolve promise with ID:", id);
        resolve(id);
        console.log("[PeerManager] Promise resolved successfully");
      });

      safeOn("error", (error) => {
        console.error("[PeerJS] Connection error:", error);
        isCreatingPeer = false; // Clear creation flag on error
        connectionState = "disconnected";
        // Clear browser tab lock on error
        if (typeof window !== "undefined") {
          try {
            delete window[CONNECTION_LOCK_KEY];
          } catch (e) {}
        }
        // Don't reject the promise to prevent uncaught errors
        console.warn("[PeerManager] Error handled, continuing with dummy peer");
      });

      // Add diagnostics for all peer events
      peerInstance.on("connection", (conn) => {
        // Lightweight connection log; reduce verbosity to avoid spamming logs
        console.log("[PeerJS] connection from", conn.peer);
      });

      peerInstance.on("disconnected", () => {
        console.warn("[PeerJS] Disconnected from signaling server");
        connectionState = "disconnected";
      });
      peerInstance.on("close", () => {
        console.warn("[PeerJS] Peer connection closed");
        connectionState = "destroyed";
        // Clean up on close
        try {
          if (typeof window !== "undefined") {
            delete window.__VIDEOX_PEER_INSTANCE;
            delete window.__VIDEOX_PEER_ID;
            delete window[CONNECTION_LOCK_KEY];
          }
        } catch (e) {}
      });
    });
  }
  return peerInstance;
}

// Register a handler to be called when an incoming call arrives
export function onIncomingCall(handler) {
  callHandlers.push(handler);
  return () => {
    callHandlers = callHandlers.filter((h) => h !== handler);
  };
}

export function getPeerId() {
  return peerId;
}

export async function waitForPeerId() {
  // If we already have a peer ID, return it immediately
  if (peerId) {
    return peerId;
  }

  // Ensure peer initialization is allowed before creating instance
  if (!isInitializationAllowed) {
    console.warn(
      "[PeerManager] Peer initialization not allowed, cannot wait for peer ID"
    );
    throw new Error("Peer initialization not allowed");
  }

  // Get or create peer instance
  const instance = getPeerInstance();

  // Critical fix: If peer already has an ID, use it immediately
  if (instance && instance.id) {
    peerId = instance.id;
    return instance.id;
  }

  // Create a robust promise that handles all cases
  return new Promise((resolve, reject) => {
    // Set up polling to catch the ID when it appears
    const pollForId = () => {
      if (!isInitializationAllowed) {
        reject(new Error("Peer initialization was blocked"));
        return;
      }
      if (instance && instance.id) {
        peerId = instance.id;
        resolve(instance.id);
        return;
      }
      if (instance && instance.destroyed) {
        resolve(null);
        return;
      }
      // Continue polling
      setTimeout(pollForId, 50);
    };

    // Also set up the open event listener as backup
    if (instance && !instance.destroyed) {
      instance.on("open", (id) => {
        peerId = id;
        resolve(id);
      });
    }

    // Start polling immediately
    pollForId();
  });
}

export function destroyPeerInstance() {
  if (destroyPromise) {
    return destroyPromise; // Return existing destroy promise to prevent multiple destroys
  }

  destroyPromise = new Promise((resolve) => {
    console.log("[PeerManager] Starting peer instance destruction");
    connectionState = "destroyed";

    try {
      if (peerInstance) {
        try {
          // Remove all listeners to prevent events during destruction
          peerInstance.off("open");
          peerInstance.off("error");
          peerInstance.off("disconnected");
          peerInstance.off("close");
          peerInstance.off("call");
          peerInstance.destroy();
          console.log("[PeerManager] Peer instance destroyed successfully");
        } catch (e) {
          console.warn("[PeerManager] Error destroying peer instance:", e);
        }
      }
    } finally {
      try {
        if (typeof window !== "undefined") {
          try {
            delete window.__VIDEOX_PEER_INSTANCE;
          } catch (e) {}
          try {
            delete window.__VIDEOX_PEER_ID;
          } catch (e) {}
          try {
            delete window[CONNECTION_LOCK_KEY];
          } catch (e) {}
        }
      } catch (e) {}

      // Reset all state
      peerInstance = null;
      peerId = null;
      openPromise = null;
      isCreatingPeer = false;
      connectionState = "disconnected";
      callHandlers = [];

      // Reset destroy promise after a delay to allow proper cleanup
      setTimeout(() => {
        destroyPromise = null;
      }, 1000);

      resolve();
    }
  });

  return destroyPromise;
}

// NEW: Function to explicitly allow peer initialization (called when user actually enters a room)
export function allowPeerInitialization(roomId) {
  // Prevent multiple initializations for the same room
  if (currentRoomId === roomId && isInitializationAllowed) {
    console.log(
      `[PeerManager] Already initialized for room ${roomId}, skipping`
    );
    return;
  }

  currentRoomId = roomId;
  console.log(
    `[PeerManager] Peer initialization now allowed for room ${roomId}`
  );
  isInitializationAllowed = true;
}

// NEW: Function to block peer initialization (called when leaving rooms)
export function blockPeerInitialization() {
  console.log(
    `[PeerManager] Peer initialization blocked, leaving room ${currentRoomId}`
  );
  isInitializationAllowed = false;
  currentRoomId = null;
}

// Global cleanup on tab close/refresh
if (typeof window !== "undefined") {
  const handleBeforeUnload = () => {
    try {
      destroyPeerInstance();
    } catch (e) {
      console.warn("[PeerManager] Error during beforeunload cleanup:", e);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab is being hidden, potential cleanup
      try {
        if (peerInstance && connectionState === "connected") {
          console.log(
            "[PeerManager] Tab hidden, maintaining connection but preparing for cleanup"
          );
        }
      } catch (e) {}
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  document.addEventListener("visibilitychange", handleVisibilityChange);
}
