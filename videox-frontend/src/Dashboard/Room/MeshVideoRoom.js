import React, { useEffect, useRef, useState, memo } from "react";
import {
  getPeerInstance,
  waitForPeerId,
} from "../../realTimeCommunication/peerConnectionManager";
import { getSocket } from "../../realTimeCommunication/socketConnection";
import { useDispatch, useSelector } from "react-redux";

const getLocalStream = async () => {
  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
  };

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: audioConstraints,
    });
  } catch (err) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: audioConstraints,
      });
    } catch (audioErr) {
      throw new Error(
        "Could not access camera or microphone: " + audioErr.message
      );
    }
  }
};

const VideoPlayer = memo(
  ({ stream, isFullscreen, showPlaceholder = false, username = "User" }) => {
    const ref = useRef();
    const [hasActiveVideo, setHasActiveVideo] = useState(false);

    useEffect(() => {
      const videoRef = ref.current;
      if (!videoRef || !stream) return;

      let playAttempts = 0;
      const maxAttempts = 3;
      let isComponentMounted = true;

      // Check if video track is active
      const checkVideoTrackState = () => {
        const videoTracks = stream.getVideoTracks();
        const hasVideo =
          videoTracks.length > 0 &&
          videoTracks.some(
            (track) => track.enabled && track.readyState === "live"
          );

        console.log(
          `[VideoPlayer] ${username} - Video tracks:`,
          videoTracks.length,
          "Active:",
          hasVideo,
          "Track states:",
          videoTracks.map((t) => ({
            enabled: t.enabled,
            readyState: t.readyState,
          }))
        );

        setHasActiveVideo(hasVideo);
        return hasVideo;
      };

      // Initial check
      checkVideoTrackState();

      // Listen for track changes
      const handleTrackEnded = () => {
        checkVideoTrackState();
      };

      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", handleTrackEnded);
        track.addEventListener("mute", checkVideoTrackState);
        track.addEventListener("unmute", checkVideoTrackState);
      });

      // Periodic check for track state changes (fallback) - less frequent for remote users
      const checkInterval = username === "You" ? 500 : 2000; // Local: 500ms, Remote: 2s
      const trackCheckInterval = setInterval(() => {
        if (isComponentMounted) {
          checkVideoTrackState();
        }
      }, checkInterval);

      const startPlayback = async () => {
        if (!isComponentMounted || !videoRef) return;

        try {
          // Only update srcObject if it's actually different
          if (videoRef.srcObject !== stream) {
            videoRef.srcObject = stream;
          }

          // Check if video is already playing
          if (!videoRef.paused && videoRef.readyState >= 2) {
            return;
          }

          await videoRef.play();
          playAttempts = 0;
        } catch (err) {
          console.warn(
            `[VideoPlayer] Playback error (attempt ${playAttempts + 1}):`,
            err
          );

          if (playAttempts < maxAttempts && isComponentMounted) {
            playAttempts++;
            setTimeout(startPlayback, 500 * playAttempts); // Exponential backoff
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

      // Add event listeners
      videoRef.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoRef.addEventListener("canplay", handleCanPlay);
      videoRef.addEventListener("error", handleError);

      // Set the stream
      if (videoRef.srcObject !== stream) {
        videoRef.srcObject = stream;
      }

      return () => {
        isComponentMounted = false;
        clearInterval(trackCheckInterval);
        videoRef.removeEventListener("loadedmetadata", handleLoadedMetadata);
        videoRef.removeEventListener("canplay", handleCanPlay);
        videoRef.removeEventListener("error", handleError);

        // Clean up track event listeners
        stream.getTracks().forEach((track) => {
          track.removeEventListener("ended", handleTrackEnded);
          track.removeEventListener("mute", checkVideoTrackState);
          track.removeEventListener("unmute", checkVideoTrackState);
        });

        // Only clear srcObject if it matches our stream
        if (videoRef.srcObject === stream) {
          videoRef.srcObject = null;
        }
      };
    }, [stream, username]);

    // Show placeholder logic:
    // - For local user: only use showPlaceholder prop (based on Redux state)
    // - For remote users: use showPlaceholder prop primarily, track detection as fallback only if really needed
    const shouldShowPlaceholder = showPlaceholder;

    console.log(
      `[VideoPlayer] ${username} - showPlaceholder:`,
      showPlaceholder,
      "hasActiveVideo:",
      hasActiveVideo,
      "shouldShowPlaceholder:",
      shouldShowPlaceholder
    );

    if (shouldShowPlaceholder) {
      return (
        <div
          className={
            isFullscreen
              ? "rounded-lg shadow w-full h-full max-w-full max-h-full aspect-video bg-gray-800 flex items-center justify-center"
              : "rounded-md shadow w-full h-auto aspect-video bg-gray-800 flex items-center justify-center border border-orange-400"
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
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-8 h-8"
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
            <p className="text-sm">{username}</p>
            <p className="text-xs text-gray-400">Camera is off</p>
          </div>
        </div>
      );
    }

    return (
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={true} // Always muted to prevent audio feedback/echo
        className={
          isFullscreen
            ? "rounded-lg shadow w-full h-full max-w-full max-h-full aspect-video object-cover bg-black"
            : "rounded-md shadow w-full h-auto aspect-video object-cover bg-black border border-orange-400"
        }
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: window.innerWidth < 768 ? "300px" : "100%",
          objectFit: "cover",
        }}
      />
    );
  }
);

const MeshVideoRoom = ({ roomId, peerIds, controls }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
  const isAudioEnabled = useSelector((state) => state.room.isAudioEnabled);
  const isVideoEnabled = useSelector((state) => state.room.isVideoEnabled);
  const isScreenSharingActive = useSelector(
    (state) => state.room.isScreenSharingActive
  );

  // Handle screen sharing stream updates
  useEffect(() => {
    if (isScreenSharingActive && !screenSharingStream) {
      // Screen sharing started but no stream yet
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
  }, [roomId, isAudioEnabled, isVideoEnabled]);

  useEffect(() => {
    if (!peer.current) {
      peer.current = getPeerInstance();
    }
    let isMounted = true;

    const handleError = (err) => {
      if (err.type === "network" || err.type === "disconnected") {
        if (peer.current && peer.current.disconnected) {
          peer.current.reconnect();
        }
      }
    };

    const handleDisconnected = () => {
      calledPeersRef.current.clear();
      if (peer.current && isMounted && peer.current.disconnected) {
        setTimeout(() => {
          try {
            peer.current.reconnect();
          } catch (err) {
            console.error("[MeshVideoRoom] Reconnection failed:", err);
          }
        }, 1000);
      }
    };

    const handleClose = () => {
      if (isMounted) {
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

    const connectToPeers = (id) => {
      if (peerIds && localStream) {
        const uniquePeerIds = [...new Set(peerIds.filter((pid) => pid !== id))];
        uniquePeerIds.forEach((peerId) => {
          if (!calledPeersRef.current.has(peerId)) {
            const call = peer.current.call(peerId, localStream);
            calledPeersRef.current.add(peerId);

            call.on("stream", (remoteStream) => {
              setRemoteStreams((prev) => {
                const withoutPeer = prev.filter((s) => s.peerId !== peerId);
                return [...withoutPeer, { peerId, stream: remoteStream }];
              });
            });

            call.on("error", () => {
              calledPeersRef.current.delete(peerId);
            });
          }
        });
      }
    };

    waitForPeerId().then((id) => {
      if (isMounted) {
        setMyPeerId(id);
        connectToPeers(id);
      }
    });

    return () => {
      if (peer.current) {
        peer.current.off("error", handleError);
        peer.current.off("disconnected", handleDisconnected);
        peer.current.off("close", handleClose);
      }
      isMounted = false;
    };
  }, [roomId, peerIds, localStream]);

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
        const call = peer.current.call(otherPeerId, localStream);
        calledPeersRef.current.add(otherPeerId);

        call.on("stream", (remoteStream) => {
          handleStream(otherPeerId, remoteStream);
        });

        call.on("error", (err) => {
          calledPeersRef.current.delete(otherPeerId);
        });

        call.on("close", () => {
          calledPeersRef.current.delete(otherPeerId);
        });
      });
    }

    setRemoteStreams((prev) =>
      prev.filter((s) => uniquePeerIds.includes(s.peerId))
    );
  }, [myPeerId, localStream, peerIds, handleStream]);

  useEffect(() => {
    if (!peer.current || !localStream) return;

    const handleCall = (call) => {
      call.answer(localStream);

      const handleStream = (remoteStream) => {
        calledPeersRef.current.add(call.peer);
        setRemoteStreams((prev) => {
          const withoutPeer = prev.filter((s) => s.peerId !== call.peer);
          return [...withoutPeer, { peerId: call.peer, stream: remoteStream }];
        });
      };

      const handleError = (err) => {
        calledPeersRef.current.delete(call.peer);

        setRemoteStreams((prev) => prev.filter((s) => s.peerId !== call.peer));
      };

      const handleClose = () => {
        calledPeersRef.current.delete(call.peer);

        setRemoteStreams((prev) => prev.filter((s) => s.peerId !== call.peer));
      };

      call.on("stream", handleStream);
      call.on("error", handleError);
      call.on("close", handleClose);

      return () => {
        call.off("stream", handleStream);
        call.off("error", handleError);
        call.off("close", handleClose);
      };
    };

    peer.current.on("call", handleCall);
    return () => peer.current?.off("call", handleCall);
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
      if (calledPeersRef.current.has(peerId)) {
        calledPeersRef.current.delete(peerId);
      }

      setRemoteStreams((prev) => prev.filter((s) => s.peerId !== peerId));

      // If we have a local stream, initiate a new call
      if (localStream && peer.current && peerId !== myPeerId) {
        const call = peer.current.call(peerId, localStream);
        calledPeersRef.current.add(peerId);

        call.on("stream", (remoteStream) => {
          setRemoteStreams((prev) => {
            const withoutPeer = prev.filter((s) => s.peerId !== peerId);
            return [...withoutPeer, { peerId, stream: remoteStream }];
          });
        });

        call.on("error", (err) => {
          calledPeersRef.current.delete(peerId);
        });
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
    return () => {
      // Cleanup remote streams using ref to avoid dependency
      remoteStreamsRef.current.forEach(({ stream }) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      setRemoteStreams([]);
    };
  }, [roomId]);

  return (
    <div
      className="flex flex-col justify-between items-center relative w-full h-full"
      style={{ minHeight: "0", height: "100%" }}
    >
      <div
        className="grid w-full flex-1 gap-4 p-2 md:grid-cols-auto-fit"
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
          <div className="flex flex-col items-center justify-center w-full min-h-[300px] md:h-full">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-2 justify-center w-full font-medium">
              You
              {!isAudioEnabled && (
                <span
                  title="Muted"
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
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
              {!isVideoEnabled && (
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
              stream={localStream}
              isFullscreen={false}
              showPlaceholder={!isVideoEnabled}
              username="You"
            />
          </div>
        )}

        {remoteStreams.map(({ peerId, stream }) => {
          let username = peerId;
          let isAudio = true,
            isVideo = true,
            isScreen = false;

          const participant = roomDetails?.participants?.find(
            (p) => p.peerId === peerId
          );
          if (participant) {
            username = participant.username || peerId;
            isAudio = participant.isAudioEnabled !== false;
            isVideo = participant.isVideoEnabled !== false;
            isScreen = !!participant.isScreenSharingActive;
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
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
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
                stream={stream}
                isFullscreen={true}
                showPlaceholder={!isVideo}
                username={username}
              />
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
