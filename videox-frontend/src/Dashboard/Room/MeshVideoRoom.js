import {
  getPeerInstance,
  waitForPeerId,
  onIncomingCall,
  allowPeerInitialization,
  blockPeerInitialization,
} from "../../realTimeCommunication/peerConnectionManager";
import React, { useEffect, useRef, useState, memo } from "react";
import { getSocket } from "../../realTimeCommunication/socketConnection";
import { useDispatch, useSelector } from "react-redux";

const getLocalStream = async () => {
  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
  };

  // Try a simple, broadly compatible constraint first to maximize chance of success
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: audioConstraints,
    });

    // Ensure video tracks are enabled when present
    try {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks && videoTracks.length > 0) {
        videoTracks.forEach((t) => (t.enabled = true));
      }
    } catch (e) {
      console.warn("Error enabling video tracks:", e);
    }

    console.log(
      "[getLocalStream] Obtained stream. Video tracks:",
      stream.getVideoTracks().length
    );
    return stream;
  } catch (err) {
    console.warn(
      "[getLocalStream] getUserMedia(video=true) failed:",
      err.message
    );
    // Try a gentler video constraint (facingMode)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: audioConstraints,
      });
      stream.getVideoTracks().forEach((t) => (t.enabled = true));
      console.log(
        "[getLocalStream] Obtained stream with facingMode. Video tracks:",
        stream.getVideoTracks().length
      );
      return stream;
    } catch (err2) {
      console.warn(
        "[getLocalStream] getUserMedia(facingMode) failed:",
        err2.message
      );
      // Fallback to audio-only
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: audioConstraints,
        });
        console.log("[getLocalStream] Falling back to audio-only stream");
        return audioOnly;
      } catch (audioErr) {
        throw new Error(
          "Could not access camera or microphone: " + audioErr.message
        );
      }
    }
  }
};

const VideoPlayer = memo(
  ({
    stream,
    isFullscreen,
    showPlaceholder = false,
    username = "User",
    forceVideoEnabled = false,
  }) => {
    const ref = useRef();
    const [hasActiveVideo, setHasActiveVideo] = useState(false);
    const [forceShowPlaceholder, setForceShowPlaceholder] = useState(false);
    const [isInitializing, setIsInitializing] = useState(() => {
      // Start initializing only for local user when we don't yet have a video track.
      try {
        if (username === "You") {
          return !(stream && stream.getVideoTracks().length > 0);
        }
      } catch (e) {
        return true;
      }
      return false;
    });

    useEffect(() => {
      const videoRef = ref.current;
      if (!videoRef || !stream) return;

      let playAttempts = 0;
      const maxAttempts = 3;
      let isComponentMounted = true;

      const checkVideoTrackState = () => {
        const videoTracks = stream.getVideoTracks();
        // Consider a track active if it exists, is enabled and is not ended.
        // Also treat the stream as having video if the MediaStream is active and contains video tracks.
        const hasVideoBasedOnTracks =
          videoTracks.length > 0 &&
          videoTracks.some(
            (track) => track.enabled && track.readyState !== "ended"
          );

        const hasVideoBasedOnStreamActive =
          stream.active && videoTracks.length > 0;

        let hasVideo = hasVideoBasedOnTracks || hasVideoBasedOnStreamActive;

        // Be more permissive for the local user: if this is the local stream
        // and there is at least one video track, treat it as active to avoid
        // showing a placeholder due to timing/readyState differences across browsers.
        if (username === "You" && videoTracks.length > 0) {
          hasVideo = true;
        }

        // For remote users, if forceVideoEnabled is true, prioritize that over track states
        // This handles cases where participant has video enabled but tracks appear disabled
        if (forceVideoEnabled && username !== "You") {
          // Removed excessive logging
          hasVideo = true;
        }

        // Override hasVideo based on showPlaceholder for remote users only
        if (username !== "You") {
          if (showPlaceholder) {
            hasVideo = false; // Force placeholder when user has video off
          } else if (forceVideoEnabled) {
            hasVideo = true; // Force video when user has video on
          }
        }

        // Reduced logging - only log significant changes
        if (Math.random() < 0.01) {
          // Log only 1% of the time to reduce spam
          console.log(
            `[VideoPlayer] ${username} - Video tracks: ${videoTracks.length} Active: ${hasVideo}`
          );
        }

        // If local user, clear any initializing state when we detect a video
        if (username === "You" && hasVideo) {
          setIsInitializing(false);
        }

        setHasActiveVideo(hasVideo);
        return hasVideo;
      };

      checkVideoTrackState();

      const handleTrackEnded = () => {
        checkVideoTrackState();
      };

      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", handleTrackEnded);
        track.addEventListener("mute", checkVideoTrackState);
        track.addEventListener("unmute", checkVideoTrackState);
      });

      const checkInterval = username === "You" ? 500 : 2000;
      const trackCheckInterval = setInterval(() => {
        if (isComponentMounted) {
          checkVideoTrackState();
        }
      }, checkInterval);

      // Hide the initializing overlay after a short timeout if we don't detect active video
      let initTimeout = null;
      if (username === "You") {
        initTimeout = setTimeout(() => {
          // Only clear initializing if we still don't detect an active video
          setIsInitializing((prev) => (hasActiveVideo ? false : false));
        }, 700);
      }

      // If stream changes and contains video, clear initializing immediately
      if (username === "You" && stream && stream.getVideoTracks().length > 0) {
        setIsInitializing(false);
      }

      const startPlayback = async () => {
        if (!isComponentMounted || !videoRef) return;

        try {
          console.log(
            `[VideoPlayer] 🎥 ${username} - Starting playback attempt`
          );

          // Only update srcObject if it's actually different
          if (videoRef.srcObject !== stream) {
            console.log(`[VideoPlayer] 🔄 ${username} - Setting new srcObject`);
            videoRef.srcObject = stream;
          }

          // Ensure muted allows autoplay in browsers
          videoRef.muted = true;

          // Apply critical styles for proper display
          videoRef.style.backgroundColor = "#fed7aa"; // Light orange background
          videoRef.style.objectFit = "cover";
          videoRef.style.opacity = "1";
          videoRef.style.display = "block";

          if (!videoRef.paused && videoRef.readyState >= 2) {
            console.log(`[VideoPlayer] ✅ ${username} - Already playing`);
            return;
          }

          await videoRef.play();
          playAttempts = 0;
          console.log(
            `[VideoPlayer] ✅ ${username} - Playback started successfully`
          );
        } catch (err) {
          console.warn(
            `[VideoPlayer] ⚠️ ${username} - Playback error (attempt ${
              playAttempts + 1
            }):`,
            err
          );

          if (playAttempts < maxAttempts && isComponentMounted) {
            playAttempts++;
            // Try reload then play with incremental backoff
            setTimeout(() => {
              try {
                videoRef.load();
                videoRef.play().catch(() => {});
              } catch (e) {}
              startPlayback();
            }, 500 * playAttempts);
          }
        }
      };

      const handleLoadedMetadata = () => {
        console.log("[VideoPlayer] Metadata loaded, starting playback");
        startPlayback();
      };

      const handleCanPlay = () => {
        console.log("[VideoPlayer] Can play, starting playback");
        startPlayback();
      };

      const handleError = (error) => {
        console.warn("[VideoPlayer] Video error:", error);

        if (playAttempts < maxAttempts && isComponentMounted) {
          playAttempts++;
          setTimeout(() => {
            if (videoRef && isComponentMounted) {
              videoRef.load(); // Reload the video element
            }
          }, 1000 * playAttempts);
        }
      };

      videoRef.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoRef.addEventListener("canplay", handleCanPlay);
      videoRef.addEventListener("error", handleError);

      if (videoRef.srcObject !== stream) {
        videoRef.srcObject = stream;
      }

      // Try to start playback immediately; helps when loadedmetadata/canplay
      // events are not fired reliably in some environments.
      startPlayback();

      // Add timeout to detect if video is not displaying properly (only once per stream)
      let videoDisplayTimeout;
      if (!showPlaceholder && !forceVideoEnabled && stream) {
        videoDisplayTimeout = setTimeout(() => {
          if (
            videoRef &&
            isComponentMounted &&
            videoRef.readyState < 2 &&
            !forceVideoEnabled
          ) {
            setForceShowPlaceholder(true);
          }
        }, 5000); // Increased to 5 seconds and only when not force enabled
      }

      return () => {
        isComponentMounted = false;
        clearInterval(trackCheckInterval);
        clearTimeout(videoDisplayTimeout);
        if (initTimeout) clearTimeout(initTimeout);
        videoRef.removeEventListener("loadedmetadata", handleLoadedMetadata);
        videoRef.removeEventListener("canplay", handleCanPlay);
        videoRef.removeEventListener("error", handleError);

        // Clean up track event listeners
        stream.getTracks().forEach((track) => {
          track.removeEventListener("ended", handleTrackEnded);
          track.removeEventListener("mute", checkVideoTrackState);
          track.removeEventListener("unmute", checkVideoTrackState);
        });

        if (videoRef.srcObject === stream) {
          videoRef.srcObject = null;
        }
      };
    }, [stream, username, forceVideoEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset force placeholder when stream changes or placeholder is explicitly requested
    useEffect(() => {
      if (showPlaceholder || !stream) {
        setForceShowPlaceholder(false);
      }
    }, [showPlaceholder, stream]);

    // Separate effect to handle forceVideoEnabled changes (camera on/off) - CRITICAL FOR REMOTE USERS
    useEffect(() => {
      const videoRef = ref.current;
      if (!videoRef || !stream) return;

      // When camera is turned ON (forceVideoEnabled becomes true and not showing placeholder)
      if (forceVideoEnabled && !showPlaceholder) {
        console.log(
          `[VideoPlayer] 📹 ${username} - Camera turned ON, forcing video display`
        );

        // Force enable video tracks
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach((track, index) => {
          if (track.readyState !== "ended") {
            track.enabled = true;
            console.log(
              `[VideoPlayer] ✅ ${username} - Enabled track ${index}: ${track.id}`
            );
          }
        });

        // CRITICAL: Force complete refresh of video element for remote users
        const refreshVideo = async () => {
          try {
            console.log(
              `[VideoPlayer] 🔄 ${username} - Starting complete video refresh`
            );

            // Step 1: Clear current source completely
            videoRef.srcObject = null;
            videoRef.pause();

            // Step 2: Reset all critical CSS properties
            videoRef.style.backgroundColor = "#111827";
            videoRef.style.objectFit = "cover";
            videoRef.style.width = "100%";
            videoRef.style.height = "100%";
            videoRef.style.display = "block";
            videoRef.style.opacity = "1";
            videoRef.style.visibility = "visible";

            // Step 3: Wait for clear
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Step 4: Reassign stream and force reload
            videoRef.srcObject = stream;
            videoRef.load();

            // Step 5: Force muted autoplay
            videoRef.muted = true;

            // Step 6: Set up one-time event handlers for this refresh
            const onLoadedData = async () => {
              try {
                console.log(
                  `[VideoPlayer] 📺 ${username} - Video data loaded, attempting play`
                );
                await videoRef.play();
                console.log(
                  `[VideoPlayer] ✅ ${username} - Successfully playing video after camera ON`
                );
                videoRef.removeEventListener("loadeddata", onLoadedData);
              } catch (playErr) {
                console.warn(
                  `[VideoPlayer] ⚠️ ${username} - Play error:`,
                  playErr
                );
                // Retry after delay
                setTimeout(async () => {
                  try {
                    await videoRef.play();
                    console.log(
                      `[VideoPlayer] ✅ ${username} - Retry play successful`
                    );
                  } catch (e) {
                    console.warn(
                      `[VideoPlayer] ❌ ${username} - Final play retry failed:`,
                      e
                    );
                  }
                }, 500);
                videoRef.removeEventListener("loadeddata", onLoadedData);
              }
            };

            videoRef.addEventListener("loadeddata", onLoadedData);

            // Fallback: try to play immediately as well
            setTimeout(async () => {
              if (videoRef.readyState >= 2) {
                try {
                  await videoRef.play();
                  console.log(
                    `[VideoPlayer] ⚡ ${username} - Immediate play successful`
                  );
                } catch (e) {
                  console.log(
                    `[VideoPlayer] ⚡ ${username} - Immediate play failed, waiting for loadeddata`
                  );
                }
              }
            }, 200);
          } catch (err) {
            console.error(
              `[VideoPlayer] 🚨 ${username} - Critical refresh error:`,
              err
            );
          }
        };

        refreshVideo();
      }
    }, [forceVideoEnabled, showPlaceholder, stream, username]);

    // For local user, prefer showing the video element even if detection
    // temporarily reports no active video (prevents false 'Camera is off').
    // Don't show placeholder if forceVideoEnabled is true (camera should be on)
    const shouldShowPlaceholder =
      showPlaceholder || (forceShowPlaceholder && !forceVideoEnabled);

    // Do not show initializing overlay if parent explicitly requested placeholder
    const showInitializingOverlay =
      username === "You" && isInitializing && !showPlaceholder;

    if (showInitializingOverlay) {
      return (
        <div
          className={
            isFullscreen
              ? "rounded-lg shadow w-full h-full max-w-full max-h-full aspect-video bg-orange-500 flex items-center justify-center"
              : "rounded-md shadow w-full h-auto aspect-video bg-orange-500 flex items-center justify-center border border-white"
          }
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: window.innerWidth < 768 ? "300px" : "100%",
            minHeight: "200px",
          }}
        >
          <div className="text-center text-white">
            <p className="text-sm">Initializing camera...</p>
          </div>
        </div>
      );
    }

    if (shouldShowPlaceholder) {
      // Rendering placeholder
      return (
        <div
          className={
            isFullscreen
              ? "rounded-lg shadow w-full h-full max-w-full max-h-full aspect-video bg-orange-500 flex items-center justify-center"
              : "rounded-md shadow w-full h-auto aspect-video bg-orange-500 flex items-center justify-center border border-white"
          }
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: window.innerWidth < 768 ? "300px" : "100%",
            minHeight: "200px",
            backgroundColor: "#f97316", // Orange-500 fallback
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="text-center text-white"
            style={{ textAlign: "center", color: "white" }}
          >
            <div
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px auto",
              }}
            >
              <svg
                className="w-8 h-8 text-white"
                style={{ width: "32px", height: "32px", color: "white" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-sm" style={{ fontSize: "14px", color: "white" }}>
              {username}
            </p>
            <p
              className="text-xs text-white/90"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)" }}
            >
              Camera is off
            </p>
          </div>
        </div>
      );
    }

    console.log(`[VideoPlayer] 🎬 ${username} - Rendering video element`);

    // Essential stream validation with comprehensive logging for remote users
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      const trackDetails = videoTracks.map((track) => ({
        enabled: track.enabled,
        readyState: track.readyState,
        id: track.id.substring(0, 8),
      }));
      console.log(
        `[VideoPlayer] 📊 ${username} - Stream: ${
          videoTracks.length
        } video tracks, showing placeholder: ${shouldShowPlaceholder}, tracks: ${JSON.stringify(
          trackDetails
        )}`
      );
    } else {
      console.log(
        `[VideoPlayer] 📊 ${username} - No stream available, showing placeholder: ${shouldShowPlaceholder}`
      );
    }

    // Only validate stream if we're not already showing placeholder and user doesn't have forceVideoEnabled
    const hasValidVideoStream = stream && stream.getVideoTracks().length > 0;

    if (!hasValidVideoStream && !shouldShowPlaceholder && !forceVideoEnabled) {
      return (
        <div
          className={
            isFullscreen
              ? "rounded-lg shadow w-full h-full max-w-full max-h-full aspect-video bg-orange-500 flex items-center justify-center"
              : "rounded-md shadow w-full h-auto aspect-video bg-orange-500 flex items-center justify-center border border-orange-400"
          }
          style={{
            backgroundColor: "#f97316",
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: window.innerWidth < 768 ? "300px" : "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px auto",
              }}
            >
              <svg
                className="w-8 h-8 text-white"
                style={{ width: "32px", height: "32px", color: "white" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10l12 12m0-12L3 22"
                />
              </svg>
            </div>
            <p className="text-sm" style={{ fontSize: "14px", color: "white" }}>
              {username}
            </p>
            <p
              className="text-xs text-white/90"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)" }}
            >
              Video unavailable
            </p>
          </div>
        </div>
      );
    }

    // Rendering video element

    return (
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={true} // Always muted to prevent audio feedback/echo
        className={
          isFullscreen
            ? "rounded-lg shadow w-full h-full max-w-full max-h-full aspect-video object-cover bg-orange-100 border border-orange-300"
            : "rounded-md shadow w-full h-auto aspect-video object-cover bg-orange-100 border-2 border-orange-300"
        }
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: window.innerWidth < 768 ? "300px" : "100%",
          objectFit: "cover",
          display: shouldShowPlaceholder ? "none" : "block",
          visibility: shouldShowPlaceholder ? "hidden" : "visible",
          backgroundColor: "#fed7aa", // Light orange background instead of dark gray
          opacity: 1,
          zIndex: 1,
        }}
        onCanPlay={() => {
          setForceShowPlaceholder(false);
          // Force video to play when it can and apply critical styles
          if (ref.current) {
            ref.current.style.opacity = "1";
            ref.current.style.backgroundColor = "#fed7aa"; // Light orange background
            ref.current.play().catch(() => {});
            console.log(
              `[VideoPlayer] 🎯 ${username} - Video canPlay, forcing display`
            );
          }
        }}
        onPlaying={() => {
          setForceShowPlaceholder(false);
          // Ensure video is visible when playing and prevent black tiles
          if (ref.current) {
            ref.current.style.opacity = "1";
            ref.current.style.display = "block";
            ref.current.style.backgroundColor = "#fed7aa"; // Light orange background
            console.log(
              `[VideoPlayer] 📺 ${username} - Video is now playing successfully`
            );
          }
        }}
        onError={(e) => {
          console.error(`[VideoPlayer] ❌ ${username} - Video error:`, e);
          setForceShowPlaceholder(true);
        }}
        key={`${username}-${forceVideoEnabled}-${shouldShowPlaceholder}`} // Force re-render when state changes
      />
    );
  }
);

const MeshVideoRoom = ({ roomId, peerIds, controls }) => {
  // Reduce logging frequency - only log when peerIds actually change
  const peerIdsLength = peerIds ? peerIds.length : 0;
  if (peerIdsLength > 0) {
    console.log(
      "[MeshVideoRoom] 📊 Active peers:",
      peerIdsLength,
      "roomId:",
      roomId?.slice(-8)
    );
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isComponentInitialized, setIsComponentInitialized] = useState(false);
  const isMountedRef = useRef(true);

  // Refs to track current values without triggering re-renders
  const localStreamRef = useRef(null);
  const peerIdsRef = useRef([]);
  const myPeerIdRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const dispatch = useDispatch();
  const roomDetails = useSelector((state) => state.room.roomDetails);

  const [localStream, setLocalStream] = useState(null);
  const [screenSharingStream, setScreenSharingStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [myPeerId, setMyPeerId] = useState(null);

  // Update refs when state changes
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    peerIdsRef.current = peerIds || [];
  }, [peerIds]);

  useEffect(() => {
    myPeerIdRef.current = myPeerId;
  }, [myPeerId]);
  const isAudioEnabled = useSelector((state) => state.room.isAudioEnabled);
  // Video is always enabled - no toggle functionality
  const isVideoEnabled = true;
  const isScreenSharingActive = useSelector(
    (state) => state.room.isScreenSharingActive
  );

  useEffect(() => {
    if (isScreenSharingActive && !screenSharingStream) {
      console.log(
        "[MeshVideoRoom] Screen sharing started, waiting for stream..."
      );
    } else if (!isScreenSharingActive && screenSharingStream) {
      // Screen sharing stopped, clean up stream
      console.log(
        "[MeshVideoRoom] Screen sharing stopped, cleaning up stream..."
      );
      screenSharingStream.getTracks().forEach((track) => track.stop());
      setScreenSharingStream(null);
    }
  }, [isScreenSharingActive, screenSharingStream]);
  const [error, setError] = useState("");

  const peer = useRef(null);
  const calledPeersRef = useRef(new Set());
  // Map<peerId, { call, lastAttempt: number, answered: boolean }>
  const activeCallsRef = useRef(new Map());
  // Reconnect/backoff guards to avoid infinite reconnect loops
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const MAX_RECONNECT_ATTEMPTS = 6;
  const BASE_RECONNECT_DELAY = 1000; // ms
  const screenSharingStreamRef = useRef(null);

  useEffect(() => {
    screenSharingStreamRef.current = screenSharingStream;
  }, [screenSharingStream]);

  useEffect(() => {
    let isMounted = true;
    let currentStream = null;

    const setupStream = async () => {
      try {
        const stream = await getLocalStream();
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        currentStream = stream;

        stream.getAudioTracks().forEach((track) => {
          track.enabled = isAudioEnabled;
        });
        stream.getVideoTracks().forEach((track) => {
          track.enabled = isVideoEnabled;
        });

        setLocalStream(stream);

        // Emit updated presence when stream is set up with current A/V state
        if (myPeerId && roomId) {
          try {
            const socket = getSocket();
            if (socket) {
              console.log(
                "[MeshVideoRoom] Emitting initial peer-presence with A/V state:",
                { isAudioEnabled, isVideoEnabled }
              );
              socket.emit("peer-presence", {
                roomId,
                peerId: myPeerId,
                isAudioEnabled,
                isVideoEnabled,
              });
            }
          } catch (e) {
            console.warn(
              "[MeshVideoRoom] Could not emit initial peer-presence:",
              e
            );
          }
        }

        stream.getTracks().forEach((track) => {
          track.onended = () => {
            if (isMounted) {
              setupStream();
            }
          };
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
        setTimeout(setupStream, 2000);
      }
    };

    setupStream();

    const cleanupStream = (stream, label) => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (err) {
            console.warn(`[MeshVideoRoom] Error stopping ${label} track:`, err);
          }
        });
      }
    };

    return () => {
      isMounted = false;
      cleanupStream(currentStream, "local stream");
      cleanupStream(screenSharingStreamRef.current, "screen sharing stream");
    };
  }, [roomId, isAudioEnabled, isVideoEnabled, myPeerId]);

  // Separate effect to handle audio/video state changes
  useEffect(() => {
    // Update existing local stream tracks when audio/video state changes
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioEnabled;
      });
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoEnabled;
      });
    }

    // Emit updated presence to other participants when state changes
    if (myPeerId && roomId) {
      try {
        const socket = getSocket();
        if (socket) {
          console.log(
            "[MeshVideoRoom] 📡 Updating peer-presence with A/V state change:",
            { isAudioEnabled, isVideoEnabled }
          );
          console.log(
            "[MeshVideoRoom] 📡 Emitting to roomId:",
            roomId,
            "with myPeerId:",
            myPeerId
          );
          socket.emit("peer-presence", {
            roomId,
            peerId: myPeerId,
            isAudioEnabled,
            isVideoEnabled,
          });
        }
      } catch (e) {
        console.warn(
          "[MeshVideoRoom] Could not emit updated peer-presence:",
          e
        );
      }
    }
  }, [isAudioEnabled, isVideoEnabled, myPeerId, roomId, localStream]);

  useEffect(() => {
    // Ensure component is marked as mounted
    isMountedRef.current = true;

    // Prevent multiple initializations for the same room
    if (isComponentInitialized) {
      console.log(
        "[MeshVideoRoom] Component already initialized for room:",
        roomId
      );
      return;
    }

    // Allow peer initialization when component mounts (user is entering a room)
    // Only do this once per room
    console.log("[MeshVideoRoom] Initializing component for room:", roomId);
    setIsComponentInitialized(true);
    allowPeerInitialization(roomId);

    if (!peer.current) {
      peer.current = getPeerInstance();
    }

    // Skip setup if we got a dummy peer (throttled creation)
    if (peer.current && peer.current.__isDummy) {
      console.warn(
        "[MeshVideoRoom] Received dummy peer, skipping setup to prevent loops"
      );
      return;
    }

    // Use the ref for mounted state tracking

    const handleError = (err) => {
      console.warn(
        "[MeshVideoRoom] Peer error:",
        err && err.type ? err.type : err
      );
      if (err && (err.type === "network" || err.type === "disconnected")) {
        // schedule a guarded reconnect
        handleDisconnected();
      }
    };

    const handleDisconnected = () => {
      calledPeersRef.current.clear();
      try {
        if (!peer.current || !isMountedRef.current) return;

        // If we've already scheduled a reconnect, don't schedule another
        if (reconnectTimeoutRef.current) return;

        reconnectAttemptsRef.current = (reconnectAttemptsRef.current || 0) + 1;
        const attempt = reconnectAttemptsRef.current;
        if (attempt > MAX_RECONNECT_ATTEMPTS) {
          console.warn(
            "[MeshVideoRoom] Max reconnect attempts reached, not reconnecting further"
          );
          return;
        }

        const delay = Math.min(
          BASE_RECONNECT_DELAY * Math.pow(2, attempt - 1),
          30000
        );
        console.log(
          `[MeshVideoRoom] Scheduling reconnect attempt ${attempt} in ${delay}ms`
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          try {
            if (peer.current && peer.current.disconnected) {
              peer.current.reconnect();
            }
          } catch (err) {
            console.error("[MeshVideoRoom] Reconnection failed:", err);
          }
        }, delay);
      } catch (e) {
        console.warn("[MeshVideoRoom] Error during handleDisconnected:", e);
      }
    };

    const handleClose = () => {
      if (isMountedRef.current) {
        calledPeersRef.current.clear();
        setRemoteStreams([]);

        if (peer.current) {
          peer.current.destroy();
          peer.current = getPeerInstance();
          peer.current.on("error", handleError);
          peer.current.on("disconnected", handleDisconnected);
          peer.current.on("close", handleClose);
        }
      }
    };

    peer.current.on("error", handleError);
    peer.current.on("disconnected", handleDisconnected);
    peer.current.on("close", handleClose);
    // When peer opens, reset reconnect attempts and clear any scheduled reconnect
    peer.current.on("open", (id) => {
      try {
        reconnectAttemptsRef.current = 0;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      } catch (e) {}
    });

    const connectToPeers = (id) => {
      // Get current values at the time of execution
      const currentPeerIds = peerIdsRef.current;
      const currentLocalStream = localStreamRef.current;

      console.log("[MeshVideoRoom] connectToPeers called with:", {
        myId: id,
        peerIds: currentPeerIds,
        peerIdsType: typeof currentPeerIds,
        peerIdsArray: Array.isArray(currentPeerIds)
          ? currentPeerIds
          : "not array",
        localStream: !!currentLocalStream,
        peerInstance: !!peer.current,
        componentMounted: isMountedRef.current,
      });

      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.log(
          "[MeshVideoRoom] Component unmounted, skipping peer connection"
        );
        return;
      }

      // Validate requirements
      const hasValidPeerIds =
        currentPeerIds &&
        Array.isArray(currentPeerIds) &&
        currentPeerIds.length > 0;
      const hasLocalStream = !!currentLocalStream;
      const hasValidPeer =
        peer.current && !peer.current.destroyed && !peer.current.__isDummy;

      // Filter out own peer ID from the list to get actual peers to connect to
      const otherPeerIds = hasValidPeerIds
        ? currentPeerIds.filter((peerId) => peerId !== id && peerId)
        : [];
      const hasOtherPeers = otherPeerIds.length > 0;

      if (
        !hasValidPeerIds ||
        !hasLocalStream ||
        !hasValidPeer ||
        !hasOtherPeers
      ) {
        const missingItems = {
          validPeerIds: !hasValidPeerIds,
          localStream: !hasLocalStream,
          validPeerInstance: !hasValidPeer,
          componentMounted: isMountedRef.current,
          otherPeersAvailable: !hasOtherPeers,
          totalPeerIds: hasValidPeerIds ? peerIds.length : 0,
          otherPeerCount: otherPeerIds.length,
        };
        console.log(
          "[MeshVideoRoom] Not connecting to peers - missing requirements:",
          missingItems
        );

        // If we only lack other peers, that's normal for a room with just one person
        if (
          hasValidPeerIds &&
          hasLocalStream &&
          hasValidPeer &&
          !hasOtherPeers
        ) {
          console.log(
            "[MeshVideoRoom] Room only has current user - no other peers to connect to"
          );
          return;
        }

        // If we're just missing the peer instance, try to get one
        if (hasValidPeerIds && hasLocalStream && !hasValidPeer) {
          console.log("[MeshVideoRoom] Attempting to get peer instance...");
          const newPeer = getPeerInstance();
          if (newPeer && !newPeer.__isDummy) {
            peer.current = newPeer;
            console.log(
              "[MeshVideoRoom] Got new peer instance, retrying connection..."
            );
            // Retry connection with new peer
            setTimeout(() => {
              if (isMountedRef.current) {
                connectToPeers(id);
              }
            }, 100);
          }
        }
        return;
      }

      // Use the filtered list of other peer IDs for connections
      if (otherPeerIds.length > 0 && currentLocalStream) {
        console.log(
          "[MeshVideoRoom] Filtered peer IDs to connect to:",
          otherPeerIds
        );
        otherPeerIds.forEach((peerId) => {
          if (!peerId) return;
          // Only start a call if we don't already have an active call for this peer
          const existing = activeCallsRef.current.get(peerId);
          if (!existing) {
            console.log(`[MeshVideoRoom] Initiating call to peer ${peerId}`);
            try {
              const call = peer.current.call(peerId, currentLocalStream);
              calledPeersRef.current.add(peerId);
              activeCallsRef.current.set(peerId, {
                call,
                lastAttempt: Date.now(),
                answered: false,
              });

              call.on("stream", (remoteStream) => {
                console.log(
                  `[MeshVideoRoom] Received remote stream from ${peerId}:`,
                  remoteStream.id
                );

                // Force enable all tracks on remote streams to ensure they can be displayed
                // The actual show/hide logic will be handled by participant state
                remoteStream.getVideoTracks().forEach((track) => {
                  if (!track.enabled) {
                    console.log(
                      `[MeshVideoRoom] Enabling video track for ${peerId}`
                    );
                    track.enabled = true;
                  }
                });
                remoteStream.getAudioTracks().forEach((track) => {
                  if (!track.enabled) {
                    console.log(
                      `[MeshVideoRoom] Enabling audio track for ${peerId}`
                    );
                    track.enabled = true;
                  }
                });

                // mark as answered
                const meta = activeCallsRef.current.get(peerId);
                if (meta) meta.answered = true;

                setRemoteStreams((prev) => {
                  console.log(
                    `[MeshVideoRoom] Adding remote stream for ${peerId}, previous streams:`,
                    prev.length
                  );
                  const withoutPeer = prev.filter((s) => s.peerId !== peerId);
                  const newStreams = [
                    ...withoutPeer,
                    { peerId, stream: remoteStream },
                  ];
                  console.log(
                    `[MeshVideoRoom] New remote streams count:`,
                    newStreams.length
                  );
                  return newStreams;
                });
              });

              const cleanupCall = () => {
                calledPeersRef.current.delete(peerId);
                const meta = activeCallsRef.current.get(peerId);
                if (meta) {
                  try {
                    if (meta.call && typeof meta.call.close === "function")
                      meta.call.close();
                  } catch (e) {}
                  activeCallsRef.current.delete(peerId);
                }
              };

              call.on("error", (err) => {
                console.warn(
                  `[MeshVideoRoom] Call error with peer ${peerId}:`,
                  err
                );
                cleanupCall();
              });

              call.on("close", () => {
                cleanupCall();
              });
            } catch (err) {
              console.warn(
                `[MeshVideoRoom] Failed to call peer ${peerId}:`,
                err
              );
            }
          }
        });
      } else {
        console.log(
          "[MeshVideoRoom] Not connecting to peers - missing requirements:",
          {
            hasPeerIds: !!peerIds,
            hasLocalStream: !!localStream,
            peerIds: peerIds,
          }
        );
      }
    };

    console.log("[MeshVideoRoom] About to call waitForPeerId()...");
    waitForPeerId()
      .then((id) => {
        console.log("[MeshVideoRoom] waitForPeerId() resolved with ID:", id);
        if (isMountedRef.current) {
          setMyPeerId(id);
          console.log(
            "[MeshVideoRoom] My peer ID:",
            id,
            "Available peer IDs:",
            peerIds,
            "Type:",
            typeof peerIds,
            "IsArray:",
            Array.isArray(peerIds)
          );
          // Emit presence to the server so other participants know our PeerJS id
          try {
            const socket = getSocket();
            if (socket && roomId) {
              console.log(
                "[MeshVideoRoom] Emitting peer-presence for room:",
                roomId,
                "with peer ID:",
                id
              );
              socket.emit("peer-presence", {
                roomId,
                peerId: id,
                isAudioEnabled,
                isVideoEnabled,
              });
            }
          } catch (e) {
            console.warn("[MeshVideoRoom] Could not emit peer-presence:", e);
          }

          connectToPeers(id);
        } else {
          console.warn(
            "[MeshVideoRoom] Component unmounted before peer ID resolved"
          );
        }
      })
      .catch((error) => {
        console.error("[MeshVideoRoom] Failed to get peer ID:", error);
      });

    return () => {
      if (peer.current) {
        peer.current.off("error", handleError);
        peer.current.off("disconnected", handleDisconnected);
        peer.current.off("close", handleClose);
        try {
          peer.current.off("open");
        } catch (e) {}
        try {
          // Tell server we're no longer present (best-effort)
          try {
            const socket = getSocket();
            if (socket) {
              // best-effort notify server that our PeerJS presence is gone
              socket.emit("peer-absent");
            }
          } catch (e) {}

          // Don't destroy the peer instance here - let the global cleanup handle it
          // peer.current.destroy();
        } catch (e) {
          console.warn("[MeshVideoRoom] Error during cleanup:", e);
        }
        peer.current = null;
      }
      isMountedRef.current = false;
      // clear any pending reconnect timers
      try {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      } catch (e) {}
    };
  }, [roomId, isComponentInitialized]); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: peerIds, localStream, myPeerId intentionally excluded to prevent excessive re-renders

  // Ensure we destroy peer instance when component unmounts completely
  useEffect(() => {
    // Capture snapshot of active calls to avoid ref-change warnings in cleanup
    const _activeCallsSnapshot = new Map(activeCallsRef.current);
    return () => {
      console.log(
        "[MeshVideoRoom] Component unmounting, blocking peer initialization and performing cleanup"
      );

      // Block future peer creation when leaving room
      blockPeerInitialization();

      if (peer.current) {
        try {
          try {
            const socket = getSocket();
            if (socket) {
              socket.emit("peer-absent");
            }
          } catch (e) {}

          // Don't destroy the peer here - it will be handled by the peer manager
          // peer.current.destroy();
        } catch (e) {
          console.warn("[MeshVideoRoom] Error during unmount cleanup:", e);
        }
        peer.current = null;
      }
      // Ensure any active calls are closed using the snapshot
      try {
        _activeCallsSnapshot.forEach(({ call }, peerId) => {
          try {
            if (call && typeof call.close === "function") call.close();
          } catch (e) {}
        });
      } catch (e) {}
      try {
        if (typeof _activeCallsSnapshot.clear === "function")
          _activeCallsSnapshot.clear();
      } catch (e) {}

      // Only destroy peer instance if this is the last component using it
      // This is handled by the global peer manager now
    };
  }, []);

  useEffect(() => {
    const stream = isScreenSharingActive ? screenSharingStream : localStream;
    if (stream) {
      // Enable/disable tracks more carefully to prevent WebRTC issues
      try {
        // Use requestAnimationFrame to ensure DOM is ready and prevent timing issues
        requestAnimationFrame(() => {
          stream.getAudioTracks().forEach((track) => {
            if (track.readyState === "live") {
              track.enabled = isAudioEnabled;
            }
          });

          stream.getVideoTracks().forEach((track) => {
            if (track.readyState === "live") {
              track.enabled = isVideoEnabled;
            }
          });
        });
      } catch (err) {
        console.warn("[MeshVideoRoom] Error toggling tracks:", err);
      }
    }
  }, [
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharingActive,
    localStream,
    screenSharingStream,
  ]);

  const handleStream = React.useCallback((peerId, remoteStream) => {
    console.log(
      `[MeshVideoRoom] Handling stream for peer ${peerId}:`,
      remoteStream.id
    );

    setRemoteStreams((prev) => {
      // Check if we already have this exact stream
      const existingStream = prev.find(
        (s) => s.peerId === peerId && s.stream.id === remoteStream.id
      );
      if (existingStream) {
        console.log(`[MeshVideoRoom] Stream already exists for peer ${peerId}`);
        return prev;
      }

      // Clean up any existing stream for this peer first
      const existingPeerStream = prev.find((s) => s.peerId === peerId);
      if (
        existingPeerStream &&
        existingPeerStream.stream.id !== remoteStream.id
      ) {
        console.log(`[MeshVideoRoom] Replacing stream for peer ${peerId}`);
        // Stop the old stream tracks properly
        existingPeerStream.stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (err) {
            console.warn("Error stopping old track:", err);
          }
        });
      }

      // Add listeners to the new stream to detect track changes
      remoteStream.getTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          console.log(
            `[MeshVideoRoom] Track ended for peer ${peerId}:`,
            track.kind
          );
        });

        // Listen for track enable/disable changes
        const originalEnabled = track.enabled;
        const checkTrackState = () => {
          if (track.enabled !== originalEnabled) {
            console.log(
              `[MeshVideoRoom] Track ${track.kind} state changed for peer ${peerId}:`,
              track.enabled
            );
            // Force a re-render by updating the stream reference
            setRemoteStreams((current) =>
              current.map((s) =>
                s.peerId === peerId ? { ...s, lastUpdate: Date.now() } : s
              )
            );
          }
        };

        // Periodic check for track state changes
        const trackStateInterval = setInterval(checkTrackState, 500);
        track.addEventListener("ended", () =>
          clearInterval(trackStateInterval)
        );
      });

      return [
        ...prev.filter((s) => s.peerId !== peerId),
        { peerId, stream: remoteStream, lastUpdate: Date.now() },
      ];
    });
  }, []);

  useEffect(() => {
    if (!myPeerId || !localStream || !peerIds || !peer.current) return;

    const uniquePeerIds = [...new Set(peerIds.filter((id) => id !== myPeerId))];
    const newPeers = uniquePeerIds.filter(
      (id) => !calledPeersRef.current.has(id)
    );

    if (newPeers.length > 0) {
      newPeers.forEach((otherPeerId) => {
        // Avoid duplicate active calls
        const existing = activeCallsRef.current.get(otherPeerId);
        if (existing) return;

        try {
          const call = peer.current.call(otherPeerId, localStream);
          calledPeersRef.current.add(otherPeerId);
          activeCallsRef.current.set(otherPeerId, {
            call,
            lastAttempt: Date.now(),
            answered: false,
          });

          call.on("stream", (remoteStream) => {
            const meta = activeCallsRef.current.get(otherPeerId);
            if (meta) meta.answered = true;
            handleStream(otherPeerId, remoteStream);
          });

          const cleanupCall = () => {
            calledPeersRef.current.delete(otherPeerId);
            const meta = activeCallsRef.current.get(otherPeerId);
            if (meta) {
              try {
                if (meta.call && typeof meta.call.close === "function")
                  meta.call.close();
              } catch (e) {}
              activeCallsRef.current.delete(otherPeerId);
            }
          };

          call.on("error", (err) => {
            console.warn(
              `[MeshVideoRoom] Call error with peer ${otherPeerId}:`,
              err
            );
            cleanupCall();
          });

          call.on("close", () => {
            cleanupCall();
          });
        } catch (err) {
          console.warn(
            `[MeshVideoRoom] Failed to call peer ${otherPeerId}:`,
            err
          );
        }
      });
    }

    setRemoteStreams((prev) =>
      prev.filter((s) => uniquePeerIds.includes(s.peerId))
    );
  }, [myPeerId, localStream, peerIds, handleStream]);

  // Aggressive retry: attempt calls to all known peers at regular intervals
  // until we get a stream from them (helps when PeerJS connection is slow or
  // peer isn't yet listening when first call attempt is made)
  useEffect(() => {
    if (!myPeerId || !localStream || !peerIds || !peer.current) return;

    const retryAttempt = () => {
      const uniquePeerIds = [
        ...new Set(peerIds.filter((id) => id !== myPeerId)),
      ];
      const peersWithoutStreams = uniquePeerIds.filter(
        (id) => !remoteStreams.some((s) => s.peerId === id)
      );

      peersWithoutStreams.forEach((peerId) => {
        if (!peerId) return;
        // Skip if we already have an active call that hasn't timed out
        const meta = activeCallsRef.current.get(peerId);
        const now = Date.now();
        if (meta) {
          // If the call was recently attempted, skip retrying
          if (now - (meta.lastAttempt || 0) < 5000) return;
          // If the call was answered, skip
          if (meta.answered) return;
        }

        console.log(
          `[MeshVideoRoom] Retry: calling peer ${peerId} (no stream yet)`
        );
        try {
          const call = peer.current.call(peerId, localStream);
          calledPeersRef.current.add(peerId);
          activeCallsRef.current.set(peerId, {
            call,
            lastAttempt: now,
            answered: false,
          });

          call.on("stream", (remoteStream) => {
            console.log(
              `[MeshVideoRoom] Retry: received stream from ${peerId}:`,
              remoteStream.id
            );
            const m = activeCallsRef.current.get(peerId);
            if (m) m.answered = true;
            handleStream(peerId, remoteStream);
          });

          const cleanupCall = () => {
            calledPeersRef.current.delete(peerId);
            const m = activeCallsRef.current.get(peerId);
            if (m) {
              try {
                if (m.call && typeof m.call.close === "function")
                  m.call.close();
              } catch (e) {}
              activeCallsRef.current.delete(peerId);
            }
          };

          call.on("error", (err) => {
            console.warn(
              `[MeshVideoRoom] Retry: call error with ${peerId}:`,
              err
            );
            cleanupCall();
          });

          call.on("close", () => {
            cleanupCall();
          });
        } catch (err) {
          console.warn(`[MeshVideoRoom] Retry: failed to call ${peerId}:`, err);
        }
      });
    };

    // Retry every 2 seconds until all peers have streams
    const retryInterval = setInterval(retryAttempt, 2000);
    return () => clearInterval(retryInterval);
  }, [myPeerId, localStream, peerIds, remoteStreams, handleStream]);

  // Register handler for incoming calls (uses global listener in peerConnectionManager)
  useEffect(() => {
    const handleCall = (call) => {
      console.log(
        `[MeshVideoRoom] Received incoming call from peer ${call.peer}`
      );

      // Answer with current local stream (or empty if not ready yet)
      if (localStream) {
        console.log(`[MeshVideoRoom] Answering call with localStream`);
        call.answer(localStream);
      } else {
        console.warn(
          `[MeshVideoRoom] handleCall: no localStream available yet, answering with empty`
        );
        // Answer without stream to accept the call and get the remote stream
        try {
          call.answer();
        } catch (err) {
          console.warn(`[MeshVideoRoom] Failed to answer call:`, err);
        }
      }

      const handleStream = (remoteStream) => {
        console.log(
          `[MeshVideoRoom] Incoming call: received remote stream from ${call.peer}:`,
          remoteStream.id
        );

        // Force enable all tracks on remote streams to ensure they can be displayed
        // The actual show/hide logic will be handled by participant state
        remoteStream.getVideoTracks().forEach((track) => {
          if (!track.enabled) {
            console.log(
              `[MeshVideoRoom] Enabling video track for incoming call from ${call.peer}`
            );
            track.enabled = true;
          }
        });
        remoteStream.getAudioTracks().forEach((track) => {
          if (!track.enabled) {
            console.log(
              `[MeshVideoRoom] Enabling audio track for incoming call from ${call.peer}`
            );
            track.enabled = true;
          }
        });

        calledPeersRef.current.add(call.peer);
        // mark any active outgoing call as answered
        const meta = activeCallsRef.current.get(call.peer);
        if (meta) meta.answered = true;
        setRemoteStreams((prev) => {
          const withoutPeer = prev.filter((s) => s.peerId !== call.peer);
          return [...withoutPeer, { peerId: call.peer, stream: remoteStream }];
        });
      };

      const cleanupIncoming = () => {
        calledPeersRef.current.delete(call.peer);
        const meta = activeCallsRef.current.get(call.peer);
        if (meta) {
          try {
            if (meta.call && typeof meta.call.close === "function")
              meta.call.close();
          } catch (e) {}
          activeCallsRef.current.delete(call.peer);
        }
        setRemoteStreams((prev) => prev.filter((s) => s.peerId !== call.peer));
      };

      call.on("stream", handleStream);
      call.on("error", (err) => {
        console.warn(
          `[MeshVideoRoom] Incoming call error from ${call.peer}:`,
          err
        );
        cleanupIncoming();
      });
      call.on("close", () => cleanupIncoming());
    };

    // Register the handler with the global peer call listener
    const unregister = onIncomingCall(handleCall);
    return unregister;
  }, [localStream]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStateUpdate = ({ peerId, state }) => {
      if (roomDetails?.participants) {
        const updatedParticipants = roomDetails.participants.map((p) =>
          p.peerId === peerId ? { ...p, ...state } : p
        );
        dispatch({
          type: "ROOM.SET_ROOM_DETAILS",
          roomDetails: { ...roomDetails, participants: updatedParticipants },
        });
      }
    };

    socket.on("room-state-updated", handleStateUpdate);
    return () => socket.off("room-state-updated", handleStateUpdate);
  }, [roomDetails, dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUserLeft = ({ userId, peerId }) => {
      // Clean up any existing call with this peer
      if (calledPeersRef.current.has(peerId)) {
        calledPeersRef.current.delete(peerId);
      }

      setRemoteStreams((prev) => {
        const peerStream = prev.find((s) => s.peerId === peerId);
        if (peerStream) {
          peerStream.stream.getTracks().forEach((track) => {
            track.stop();
          });
        }
        return prev.filter((s) => s.peerId !== peerId);
      });

      if (roomDetails?.participants) {
        const updatedParticipants = roomDetails.participants.filter(
          (p) => String(p.userId) !== String(userId)
        );
        if (updatedParticipants.length !== roomDetails.participants.length) {
          dispatch({
            type: "ROOM.SET_ROOM_DETAILS",
            roomDetails: { ...roomDetails, participants: updatedParticipants },
          });
        }
      }
    };

    const handleUserJoined = ({ userId, peerId }) => {
      if (!peerId) {
        console.warn(
          "[MeshVideoRoom] handleUserJoined: received join with no peerId",
          userId
        );
        return;
      }

      if (calledPeersRef.current.has(peerId)) {
        calledPeersRef.current.delete(peerId);
      }

      setRemoteStreams((prev) => prev.filter((s) => s.peerId !== peerId));

      // If we have a local stream, initiate a new call
      if (localStream && peer.current && peerId !== myPeerId) {
        // Avoid duplicate calls on join
        const existing = activeCallsRef.current.get(peerId);
        if (existing) return;

        console.log(
          `[MeshVideoRoom] Handling user-joined, calling peer ${peerId}`
        );
        try {
          const call = peer.current.call(peerId, localStream);
          calledPeersRef.current.add(peerId);
          activeCallsRef.current.set(peerId, {
            call,
            lastAttempt: Date.now(),
            answered: false,
          });

          call.on("stream", (remoteStream) => {
            const meta = activeCallsRef.current.get(peerId);
            if (meta) meta.answered = true;
            console.log(
              `[MeshVideoRoom] Received remote stream (join) from ${peerId}:`,
              remoteStream.id
            );
            setRemoteStreams((prev) => {
              const withoutPeer = prev.filter((s) => s.peerId !== peerId);
              return [...withoutPeer, { peerId, stream: remoteStream }];
            });
          });

          const cleanupCall = () => {
            calledPeersRef.current.delete(peerId);
            const meta = activeCallsRef.current.get(peerId);
            if (meta) {
              try {
                if (meta.call && typeof meta.call.close === "function")
                  meta.call.close();
              } catch (e) {}
              activeCallsRef.current.delete(peerId);
            }
          };

          call.on("error", (err) => {
            console.warn(
              `[MeshVideoRoom] Call error on join with peer ${peerId}:`,
              err
            );
            cleanupCall();
          });

          call.on("close", () => cleanupCall());
        } catch (err) {
          console.warn(
            `[MeshVideoRoom] Error calling peer on join ${peerId}:`,
            err
          );
        }
      }
    };

    socket.on("room-user-left", handleUserLeft);
    socket.on("room-user-joined", handleUserJoined);

    return () => {
      socket.off("room-user-left", handleUserLeft);
      socket.off("room-user-joined", handleUserJoined);
    };
  }, [roomDetails, dispatch, localStream, myPeerId]);

  const remoteStreamsRef = useRef(remoteStreams);
  useEffect(() => {
    // Only update ref if the streams have actually changed
    if (remoteStreamsRef.current !== remoteStreams) {
      remoteStreamsRef.current = remoteStreams;
    }
  }, [remoteStreams]);

  useEffect(() => {
    const socket = getSocket();
    if (socket && roomId && myPeerId) {
      // Debounce state updates to prevent rapid changes that can cause video freezing
      const timeoutId = setTimeout(() => {
        socket.emit("room-state-update", {
          roomId,
          peerId: myPeerId,
          state: {
            isAudioEnabled,
            isVideoEnabled,
            isScreenSharingActive,
          },
        });
      }, 100); // 100ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [roomId, myPeerId, isAudioEnabled, isVideoEnabled, isScreenSharingActive]);

  useEffect(() => {
    calledPeersRef.current = new Set();
    // Reset initialization flag when room changes
    setIsComponentInitialized(false);

    // Also clear any active outgoing/incoming calls for the previous room
    const _callsBefore = new Map(activeCallsRef.current);
    _callsBefore.forEach(({ call }, peerId) => {
      try {
        if (call && typeof call.close === "function") call.close();
      } catch (e) {}
    });
    // Use a snapshot/reference at effect time to avoid ref-change warnings
    const _activeCallsForRoom = activeCallsRef.current;
    try {
      const _snapshot = new Map(_activeCallsForRoom);
      _snapshot.forEach(({ call }) => {
        try {
          if (call && typeof call.close === "function") call.close();
        } catch (e) {}
      });
    } catch (e) {}
    try {
      // clear the Map instance captured above
      if (
        _activeCallsForRoom &&
        typeof _activeCallsForRoom.clear === "function"
      )
        _activeCallsForRoom.clear();
    } catch (e) {}

    return () => {
      // Cleanup remote streams using ref to avoid dependency
      remoteStreamsRef.current.forEach(({ stream }) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      setRemoteStreams([]);

      // Ensure any active calls are torn down (use snapshot to avoid ref-change warnings)
      try {
        const _calls = new Map(_activeCallsForRoom);
        _calls.forEach(({ call }, peerId) => {
          try {
            if (call && typeof call.close === "function") call.close();
          } catch (e) {}
        });
      } catch (e) {}
      try {
        // Clear using the captured snapshot
        if (
          _activeCallsForRoom &&
          typeof _activeCallsForRoom.clear === "function"
        ) {
          _activeCallsForRoom.clear();
        }
      } catch (e) {}
    };
  }, [roomId]);

  // Component unmount cleanup - ensures room is completely disposed
  useEffect(() => {
    // Capture current values to avoid ref warnings
    const currentLocalStream = localStream;
    const currentScreenSharingStream = screenSharingStream;
    const currentRemoteStreams = remoteStreamsRef.current;
    const currentActiveCalls = activeCallsRef.current;

    return () => {
      console.log(
        "[MeshVideoRoom] 🧹 Component unmounting - disposing room completely"
      );

      // Stop local stream tracks
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach((track) => {
          track.stop();
          console.log(`[MeshVideoRoom] 🛑 Stopped local track: ${track.kind}`);
        });
      }

      // Stop screen sharing stream if active
      if (currentScreenSharingStream) {
        currentScreenSharingStream.getTracks().forEach((track) => {
          track.stop();
          console.log(
            `[MeshVideoRoom] 🛑 Stopped screen share track: ${track.kind}`
          );
        });
      }

      // Clear all remote streams
      currentRemoteStreams.forEach(({ stream }) => {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log(`[MeshVideoRoom] 🛑 Stopped remote track: ${track.kind}`);
        });
      });

      // Close all peer connections
      try {
        const activeCalls = new Map(currentActiveCalls);
        activeCalls.forEach(({ call }, peerId) => {
          if (call && typeof call.close === "function") {
            call.close();
            console.log(`[MeshVideoRoom] 🔌 Closed peer connection: ${peerId}`);
          }
        });
        currentActiveCalls.clear();
      } catch (e) {
        console.warn("[MeshVideoRoom] Error closing peer connections:", e);
      }

      console.log(
        "[MeshVideoRoom] ✅ Room completely disposed - no longer visible"
      );
    };
  }, [localStream, screenSharingStream]); // Include dependencies to capture current values

  return (
    <div
      className="flex flex-col justify-between items-center relative w-full h-full bg-white"
      style={{ minHeight: "0", height: "100%" }}
    >
      {/* Simple Header */}
      <div className="w-full bg-orange-100 border-b border-orange-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-orange-800 font-medium">
                Video Conference
              </span>
            </div>
            <span className="text-sm text-orange-600">
              {remoteStreams.length + 1} participant
              {remoteStreams.length !== 0 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div
        className="grid w-full flex-1 gap-4 p-4 bg-orange-50"
        style={{
          minHeight: 0,
          height: "100%",
          overflow: "auto",
          gridTemplateColumns: isMobile
            ? "1fr"
            : `repeat(${Math.ceil(Math.sqrt(remoteStreams.length + 1))}, 1fr)`,
          gridAutoRows: isMobile ? "min-content" : "1fr",
        }}
      >
        {localStream && (
          <div className="flex flex-col items-center justify-center w-full min-h-[300px] md:h-full bg-white rounded-xl shadow-lg border-2 border-orange-200 p-3">
            <div className="text-sm text-orange-700 mb-2 flex items-center gap-2 justify-center w-full font-medium bg-orange-100 px-3 py-1 rounded-full">
              You
              {!isAudioEnabled && (
                <span
                  title="Muted"
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-800"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                  Muted
                </span>
              )}
              {/* Video status removed - camera always on */}
              {isScreenSharingActive && (
                <span
                  title="Screen Sharing"
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Sharing
                </span>
              )}
            </div>
            <VideoPlayer
              key={`local-video-always-on`} // Video always enabled
              stream={localStream}
              isFullscreen={false}
              showPlaceholder={false} // Never show placeholder since video is always on
              username="You"
            />
          </div>
        )}

        {remoteStreams.map(({ peerId, stream }) => {
          console.log(
            "[MeshVideoRoom] Rendering remote stream for peer:",
            peerId
          );
          let username = peerId;
          let isAudio = true,
            isVideo = true,
            isScreen = false;

          const participant = roomDetails?.participants?.find(
            (p) => p.peerId === peerId
          );

          console.log(
            "[MeshVideoRoom] Participant data for",
            peerId,
            ":",
            participant
          );

          if (participant) {
            username = participant.username || peerId;
            isAudio = participant.isAudioEnabled !== false;
            isVideo = participant.isVideoEnabled !== false;
            isScreen = !!participant.isScreenSharingActive;
            console.log(
              "[MeshVideoRoom] ✅ Using participant states for",
              peerId,
              "- Audio:",
              isAudio,
              "Video:",
              isVideo,
              "Screen:",
              isScreen
            );
          } else {
            // Default to enabled when participant data is not yet available
            console.log(
              "[MeshVideoRoom] ⚠️ No participant data found for peer:",
              peerId,
              "defaulting to enabled states"
            );
            isAudio = true;
            isVideo = true; // DEFAULT VIDEO TO ENABLED
            isScreen = false;
          }

          // Check actual stream track states but be less strict
          if (stream) {
            const videoTracks = stream.getVideoTracks();

            console.log(
              `[MeshVideoRoom] Remote user ${username} - Video tracks:`,
              videoTracks.length,
              "Participant isVideo:",
              participant?.isVideoEnabled,
              "Track states:",
              videoTracks.map((t) => ({
                enabled: t.enabled,
                readyState: t.readyState,
              }))
            );

            // Only override to false if we're very sure there's no video
            // (participant says no video AND no enabled tracks)
            if (participant && participant.isVideoEnabled === false) {
              isVideo = false;
            } else if (videoTracks.length === 0) {
              // No video tracks at all
              isVideo = false;
            } else {
              // If we have video tracks, assume video is enabled unless explicitly disabled
              const hasActiveVideoTracks = videoTracks.some(
                (track) => track.enabled && track.readyState !== "ended"
              );
              if (
                hasActiveVideoTracks &&
                typeof participant?.isVideoEnabled === "undefined"
              ) {
                // Default to enabled if participant data is missing but tracks exist
                isVideo = true;
              }
            }
            // For audio, be more lenient and trust participant state primarily
            if (participant && participant.isAudioEnabled === false) {
              isAudio = false;
            }
          }

          return (
            <div
              key={peerId}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-1 justify-center w-full">
                {username}
                {!isAudio && (
                  <span
                    title="Muted"
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-800"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                    Muted
                  </span>
                )}
                {!isVideo && (
                  <span
                    title="Video Off"
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                    Video Off
                  </span>
                )}
                {isScreen && (
                  <span
                    title="Screen Sharing"
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Sharing
                  </span>
                )}
              </div>
              <VideoPlayer
                key={`${peerId}-${isVideo ? "video-on" : "video-off"}`} // Force re-mount when video state changes
                stream={stream}
                isFullscreen={true}
                showPlaceholder={!isVideo} // Show placeholder when user has video disabled
                username={username}
                forceVideoEnabled={isVideo} // Force video to show when participant has video enabled
              />
              {console.log(
                "[MeshVideoRoom] 🎥 VideoPlayer props for",
                username,
                "- showPlaceholder:",
                !isVideo,
                "forceVideoEnabled:",
                isVideo
              )}
            </div>
          );
        })}
      </div>

      {controls && (
        <div
          style={{
            width: "100%",
            position: "sticky",
            bottom: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.10)",
            paddingBottom: 16,
            paddingTop: 8,
          }}
        >
          {controls}
        </div>
      )}

      {localStream && localStream.getVideoTracks().length === 0 && !error && (
        <div className="text-yellow-500 text-xs mt-1">
          Audio only (no camera access)
        </div>
      )}
    </div>
  );
};

export default MeshVideoRoom;
