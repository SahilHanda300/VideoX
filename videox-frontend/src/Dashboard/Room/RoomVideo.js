import React from "react";
import { useLocalStream } from "../../shared/utilities/useLocalStream";

const RoomVideo = () => {
  const { videoRef, error } = useLocalStream();
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center">
      {error && <span className="text-red-400 text-sm mb-2">{error}</span>}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="rounded-lg shadow-lg w-full max-w-xs bg-black"
        style={{ minHeight: 180 }}
      />
    </div>
  );
};

export default RoomVideo;
