import { useEffect, useRef, useState } from "react";

export function useLocalStream(constraints = { video: true, audio: true }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let localStream;
    const getStream = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(localStream);
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      } catch (err) {
        setError("Could not access camera/microphone: " + err.message);
      }
    };
    getStream();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { videoRef, error, stream };
}
