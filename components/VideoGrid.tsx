"use client";

import { useEffect, useRef } from "react";

interface PeerData {
  peer: any;
  stream: MediaStream;
}

interface VideoGridProps {
  peers: Map<string, PeerData>;
}

export default function VideoGrid({ peers }: VideoGridProps) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    peers.forEach((peerData, userId) => {
      const videoElement = videoRefs.current.get(userId);
      if (videoElement && peerData.stream) {
        // Only set if stream is different
        if (videoElement.srcObject !== peerData.stream) {
          videoElement.srcObject = peerData.stream;
        }
      }
    });

    // Clean up video elements for removed peers
    const currentUserIds = new Set(peers.keys());
    videoRefs.current.forEach((element, userId) => {
      if (!currentUserIds.has(userId)) {
        if (element.srcObject) {
          const stream = element.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          element.srcObject = null;
        }
        videoRefs.current.delete(userId);
      }
    });
  }, [peers]);

  if (peers.size === 0) {
    return (
      <div className="text-center text-gray-500 py-12 border border-zinc-800 rounded-lg bg-zinc-950">
        <p className="text-sm">Waiting for others to join...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from(peers.entries())
        .filter(([userId]) => userId) // Filter out undefined/null userIds
        .map(([userId, peerData]) => (
          <div
            key={userId || `peer-${Math.random()}`}
            className="relative bg-black rounded-lg overflow-hidden aspect-video border border-zinc-800"
          >
            <video
              ref={(el) => {
                if (el && userId) {
                  videoRefs.current.set(userId, el);
                  if (peerData.stream && el.srcObject !== peerData.stream) {
                    el.srcObject = peerData.stream;
                  }
                }
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-zinc-700">
              {userId ? userId.slice(0, 8) : "Unknown"}
            </div>
          </div>
        ))}
    </div>
  );
}

