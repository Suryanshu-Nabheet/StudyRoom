"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

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
function calculateGrid(
  totalParticipants: number,
  isMobile: boolean
): { cols: number; rows: number } {
  if (totalParticipants === 0) return { cols: 1, rows: 1 };
  if (totalParticipants === 1) return { cols: 1, rows: 1 };

  if (isMobile) {
    // Mobile: simpler grid, max 2 columns
    if (totalParticipants === 2) return { cols: 1, rows: 2 }; // Stack vertically on mobile for 2
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

  // For larger numbers, prioritize visibility over perfect squares
  const cols = Math.ceil(Math.sqrt(totalParticipants));
  const rows = Math.ceil(totalParticipants / cols);
  return { cols, rows };
}

export default function VideoGrid({
  peers,
  localStream,
  previewStream,
  mySocketId,
  participants,
  userName,
}: VideoGridProps) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const displayStream = previewStream || localStream;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
          stream.getTracks().forEach((track) => track.stop());
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
        <div className="text-center space-y-6 animate-in fade-in duration-700">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse"></div>
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-t-blue-600 border-r-blue-400 border-b-transparent border-l-transparent animate-spin"></div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 text-base font-medium">
              Waiting for participants...
            </p>
            <p className="text-gray-500 text-sm">
              Invite others to join the meeting
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // Grid container – scrollable and responsive
    <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
      <div
        className="grid gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 w-full transition-all duration-500 ease-out p-1 sm:p-0"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          // Use auto rows to prevent cutting off, but try to fit in viewport if possible
          gridAutoRows: rows > 2 ? "minmax(150px, 1fr)" : "minmax(0, 1fr)",
          minHeight: rows > 2 ? "min-content" : "100%",
          height: rows > 2 ? "auto" : "100%",
        }}
      >
        {/* Local video */}
        {displayStream && (
          <div
            className="video-tile-wrapper group"
            onMouseEnter={() => setHoveredVideo("local")}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            <div
              className={`relative h-full rounded-md sm:rounded-lg lg:rounded-xl overflow-hidden border transition-all duration-200 ${
                hoveredVideo === "local"
                  ? "border-blue-500 shadow-lg shadow-blue-500/20"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {/* Video element */}
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

              {/* Top right indicators */}
              <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex items-center gap-1 sm:gap-1.5">
                {/* Connection indicator */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-white/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-[9px] border border-gray-200 shadow-sm">
                  <div className="relative">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></div>
                    <div className="absolute inset-0 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="font-medium text-gray-900 hidden xs:inline">
                    Live
                  </span>
                </div>
              </div>

              {/* Bottom info bar - more compact on mobile */}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-white/90 backdrop-blur-xl px-1.5 sm:px-2 py-1 sm:py-1.5 rounded border border-gray-200 shadow-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold shadow-sm">
                      {(userName || "You").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 text-[10px] sm:text-xs font-semibold truncate max-w-[80px] sm:max-w-none">
                        {userName || "You"}
                      </span>
                      <span className="text-blue-600 text-[8px] sm:text-[9px] font-medium">
                        You
                      </span>
                    </div>
                  </div>

                  {/* Audio indicator */}
                  <div className="flex items-center gap-0.5 bg-white/90 backdrop-blur-xl px-1 sm:px-1.5 py-1 sm:py-1.5 rounded border border-gray-200 shadow-sm">
                    <Icon
                      name="mic"
                      size={10}
                      className="sm:w-3 sm:h-3 text-green-600"
                    />
                    <div className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-green-500 rounded-full audio-bar"
                          style={{
                            height: `${4 + i * 2}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover overlay with actions - more subtle */}
              {hoveredVideo === "local" && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-opacity duration-200">
                  <button className="p-1.5 sm:p-2 bg-white hover:bg-gray-50 backdrop-blur-md rounded-lg border border-gray-200 shadow-lg transition-all duration-150 touch-manipulation">
                    <Icon
                      name="maximize"
                      size={14}
                      className="sm:w-4 sm:h-4 text-gray-700"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Peer videos - only show peers with remote streams */}
        {Array.from(peers.entries())
          .filter(([userId, peerData]) => {
            // Only show peers that have remote streams (not local stream placeholders)
            return (
              userId && peerData.stream && peerData.stream !== displayStream
            );
          })
          .map(([userId, peerData], index) => {
            const participant = participants.get(userId);
            const displayName = participant?.username || userId.slice(0, 8);
            const isHost = participant?.isHost || false;

            return (
              <div
                key={userId}
                className="video-tile-wrapper group animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 80}ms` }}
                onMouseEnter={() => setHoveredVideo(userId)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                <div
                  className={`relative h-full rounded-lg lg:rounded-xl overflow-hidden border transition-all duration-200 ${
                    hoveredVideo === userId
                      ? "border-green-500 shadow-lg shadow-green-500/20"
                      : "border-gray-200 shadow-sm"
                  }`}
                >
                  {/* Video element */}
                  <video
                    ref={(el) => {
                      if (el && userId) {
                        videoRefs.current.set(userId, el);
                        if (
                          peerData.stream &&
                          el.srcObject !== peerData.stream
                        ) {
                          el.srcObject = peerData.stream;
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                  {/* Top right indicators */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    {isHost && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-md px-2 py-1 rounded-md border border-amber-400/30 shadow-sm">
                        <Icon name="crown" size={10} className="text-white" />
                        <span className="text-[9px] font-bold text-white hidden sm:inline">
                          HOST
                        </span>
                      </div>
                    )}
                    {/* Connection indicator */}
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                      <div className="relative">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <div className="absolute inset-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom info bar - more compact */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xl px-2 py-1.5 rounded-md border border-gray-200 shadow-sm max-w-[70%]">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-gray-900 text-xs font-semibold truncate">
                            {displayName}
                          </span>
                          <span className="text-green-600 text-[9px] font-medium">
                            Participant
                          </span>
                        </div>
                      </div>

                      {/* Audio indicator */}
                      <div className="flex items-center gap-0.5 bg-white/90 backdrop-blur-xl px-1.5 py-1.5 rounded-md border border-gray-200 shadow-sm">
                        <Icon name="mic" size={12} className="text-green-600" />
                        <div className="flex gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-0.5 bg-green-500 rounded-full audio-bar"
                              style={{
                                height: `${6 + i * 2}px`,
                                animationDelay: `${i * 0.1}s`,
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay with actions - more subtle */}
                  {hoveredVideo === userId && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center gap-2 transition-opacity duration-200">
                      <button className="p-2 bg-white hover:bg-gray-50 backdrop-blur-md rounded-lg border border-gray-200 shadow-lg transition-all duration-150">
                        <Icon
                          name="maximize"
                          size={16}
                          className="text-gray-700"
                        />
                      </button>
                      <button className="p-2 bg-white hover:bg-gray-50 backdrop-blur-md rounded-lg border border-gray-200 shadow-lg transition-all duration-150">
                        <Icon name="pin" size={16} className="text-gray-700" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
