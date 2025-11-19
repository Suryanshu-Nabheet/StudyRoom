"use client";

import { useEffect, useRef, useState } from "react";

interface PeerData {
  peer: any;
  stream: MediaStream;
}

interface UserInfo {
  id: string;
  username: string;
  isHost?: boolean;
}

interface VideoGridProps {
  peers: Map<string, PeerData>;
  localStream: MediaStream | null;
  previewStream: MediaStream | null;
  mySocketId: string | null;
  participants: Map<string, UserInfo>;
  userName: string | null;
}

// Calculate grid layout - responsive based on screen size
function calculateGrid(totalParticipants: number, isMobile: boolean): { cols: number; rows: number } {
  if (totalParticipants === 0) return { cols: 1, rows: 1 };
  if (totalParticipants === 1) return { cols: 1, rows: 1 };
  
  if (isMobile) {
    // Mobile: simpler grid, max 2 columns
    if (totalParticipants === 2) return { cols: 2, rows: 1 };
    if (totalParticipants <= 4) return { cols: 2, rows: 2 };
    if (totalParticipants <= 6) return { cols: 2, rows: 3 };
    // For more on mobile, use 2 columns
    return { cols: 2, rows: Math.ceil(totalParticipants / 2) };
  }
  
  // Desktop: more flexible grid
  if (totalParticipants === 2) return { cols: 2, rows: 1 };
  if (totalParticipants <= 4) return { cols: 2, rows: 2 };
  if (totalParticipants <= 6) return { cols: 3, rows: 2 };
  if (totalParticipants <= 9) return { cols: 3, rows: 3 };
  if (totalParticipants <= 12) return { cols: 4, rows: 3 };
  if (totalParticipants <= 16) return { cols: 4, rows: 4 };
  if (totalParticipants <= 20) return { cols: 5, rows: 4 };
  if (totalParticipants <= 25) return { cols: 5, rows: 5 };
  // For more than 25, use a reasonable grid
  const cols = Math.ceil(Math.sqrt(totalParticipants));
  const rows = Math.ceil(totalParticipants / cols);
  return { cols, rows };
}

export default function VideoGrid({ peers, localStream, previewStream, mySocketId, participants, userName }: VideoGridProps) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const displayStream = previewStream || localStream;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Set local video stream - prevent flickering by checking if already set
    if (localVideoRef.current && displayStream) {
      if (localVideoRef.current.srcObject !== displayStream) {
        localVideoRef.current.srcObject = displayStream;
        setIsLoading(false);
      }
    } else if (!displayStream) {
      setIsLoading(true);
    }

    // Set peer streams - prevent flickering
    peers.forEach((peerData, userId) => {
      const videoElement = videoRefs.current.get(userId);
      if (videoElement && peerData.stream) {
        // Only set remote streams (not local stream placeholders)
        const isRemoteStream = peerData.stream !== displayStream;
        if (isRemoteStream && videoElement.srcObject !== peerData.stream) {
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
  }, [peers, displayStream]);

  // Count only peers with remote streams (not placeholders)
  const remotePeers = Array.from(peers.entries()).filter(
    ([, peerData]) => peerData.stream && peerData.stream !== displayStream
  );
  const totalParticipants = remotePeers.length + (displayStream ? 1 : 0);
  const { cols, rows } = calculateGrid(totalParticipants, isMobile);

  if (totalParticipants === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400 text-sm">Waiting for others to join...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid gap-2 sm:gap-3 h-full w-full transition-all duration-300"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {/* Local video */}
      {displayStream && (
        <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-lg sm:rounded-xl overflow-hidden border border-zinc-800 sm:border-2 shadow-xl sm:shadow-2xl transition-all duration-300 group">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-black/70 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium px-2 py-1 sm:px-3 sm:py-1.5 rounded sm:rounded-lg border border-white/10 shadow-lg truncate max-w-[calc(100%-4rem)]">
            {userName || "You"}
          </div>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border border-black sm:border-2 shadow-lg animate-pulse"></div>
        </div>
      )}

      {/* Peer videos - only show peers with remote streams */}
      {Array.from(peers.entries())
        .filter(([userId, peerData]) => {
          // Only show peers that have remote streams (not local stream placeholders)
          return userId && peerData.stream && peerData.stream !== displayStream;
        })
        .map(([userId, peerData], index) => (
          <div
            key={userId}
            className="relative bg-gradient-to-br from-zinc-900 to-black rounded-lg sm:rounded-xl overflow-hidden border border-zinc-800 sm:border-2 shadow-xl sm:shadow-2xl transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-black/70 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium px-2 py-1 sm:px-3 sm:py-1.5 rounded sm:rounded-lg border border-white/10 shadow-lg truncate max-w-[calc(100%-4rem)]">
              {participants.get(userId)?.username || userId.slice(0, 8)}
            </div>
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border border-black sm:border-2 shadow-lg"></div>
          </div>
        ))}
    </div>
  );
}
