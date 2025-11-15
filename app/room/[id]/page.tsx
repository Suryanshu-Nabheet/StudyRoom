"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoGrid from "@/components/video/VideoGrid";
import Sidebar from "@/components/layout/Sidebar";
import MeetingEnded from "@/components/ui/MeetingEnded";
import Icon from "@/components/ui/Icon";
import { useRoomStore } from "@/store/roomStore";
import { initWebRTC } from "@/lib/webrtc";
import { toast } from "@/components/ui/toast";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const {
    peers,
    localStream,
    mySocketId,
    meetingTitle,
    userName,
    meetingEnded,
    participants,
    isHost,
    setRoomId,
    setMeetingTitle,
    setUserName,
    setLocalStream,
    setPeers,
    setMySocketId,
  } = useRoomStore();
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get userName and meetingTitle from sessionStorage on mount
  useEffect(() => {
    const storedName = sessionStorage.getItem("userName");
    const storedTitle = sessionStorage.getItem("meetingTitle");
    
    if (storedName) {
      setUserName(storedName);
    }
    if (storedTitle) {
      setMeetingTitle(storedTitle);
    }
  }, [setUserName, setMeetingTitle]);

  // Add current user to participants when socket ID is available
  useEffect(() => {
    if (mySocketId && userName) {
      const { addParticipant } = useRoomStore.getState();
      addParticipant(mySocketId, userName);
    }
  }, [mySocketId, userName]);

  // Set room ID in store
  useEffect(() => {
    if (roomId) {
      setRoomId(roomId);
    }
  }, [roomId, setRoomId]);

  // Update document title with meeting title
  useEffect(() => {
    if (meetingTitle) {
      document.title = `${meetingTitle} - Study Room`;
    } else {
      document.title = "Study Room - Premium Video Meetings";
    }
    return () => {
      document.title = "Study Room - Premium Video Meetings";
    };
  }, [meetingTitle]);

  // Monitor socket connection and listen for room metadata
  useEffect(() => {
    const initSocket = async () => {
      const { getSocket } = await import("@/lib/socket");
      const socket = getSocket();
      
      const onConnect = () => {
        setIsConnected(true);
        setIsLoading(false);
      };
      
      const onDisconnect = () => {
        setIsConnected(false);
      };

      // Listen for room metadata (meeting title and host status)
      const onRoomMetadata = (metadata: { title?: string; createdAt?: Date; isHost?: boolean }) => {
        if (metadata) {
          const { setMeetingTitle, setIsHost } = useRoomStore.getState();
          if (metadata.title && !meetingTitle) {
            setMeetingTitle(metadata.title);
          }
          if (metadata.isHost !== undefined) {
            setIsHost(metadata.isHost);
          }
        }
      };

      // Listen for meeting ended
      const onMeetingEnded = (data: { message: string }) => {
        const { setMeetingEnded } = useRoomStore.getState();
        setMeetingEnded(true);
        toast.info(data.message || "The meeting has ended");
      };

      // Listen for meeting ended success (host only)
      const onMeetingEndedSuccess = (data: { message: string }) => {
        toast.success(data.message || "Meeting ended successfully");
        router.push("/");
      };

      // Listen for errors
      const onError = (error: { message: string }) => {
        console.error("Socket error:", error.message);
        toast.error(error.message);
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("room-metadata", onRoomMetadata);
      socket.on("meeting-ended", onMeetingEnded);
      socket.on("meeting-ended-success", onMeetingEndedSuccess);
      socket.on("error", onError);

      if (socket.connected) {
        setIsConnected(true);
        setIsLoading(false);
      }

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("room-metadata", onRoomMetadata);
        socket.off("meeting-ended", onMeetingEnded);
        socket.off("meeting-ended-success", onMeetingEndedSuccess);
        socket.off("error", onError);
      };
    };

    initSocket();
  }, [meetingTitle, setMeetingTitle, router]);

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}?token=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndMeeting = async () => {
    if (!isHost) {
      toast.error("Only the host can end the meeting");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to end the meeting for all participants?");
    if (!confirmed) return;

    try {
      const { getSocket } = await import("@/lib/socket");
      const socket = getSocket();
      socket.emit("end-meeting");
      toast.info("Ending meeting...");
    } catch (error: any) {
      console.error("Error ending meeting:", error);
      toast.error("Failed to end meeting");
    }
  };

  useEffect(() => {
    if (!roomId) return;

    let cleanup: (() => void) | undefined;
    let stream: MediaStream | null = null;
    let mounted = true;

    const setupMedia = async () => {
      try {
        setIsLoading(true);
        // First, ensure socket is initialized
        const { getSocket } = await import("@/lib/socket");
        const socket = getSocket();
        
        // Wait for socket to connect with timeout
        if (!socket.connected) {
          console.log("⏳ Waiting for socket connection...");
          let connectionResolved = false;
          
          await new Promise<void>((resolve) => {
            if (socket.connected) {
              resolve();
              return;
            }
            
            // Set a reasonable timeout - don't block forever
            const connectionTimeout = setTimeout(() => {
              if (!connectionResolved) {
                connectionResolved = true;
                socket.off("connect", onConnect);
                socket.off("connect_error", onError);
                // Continue anyway - socket.io will reconnect in background
                console.log("⏳ Connection in progress, continuing setup...");
                resolve();
              }
            }, 8000); // 8 second timeout
            
            const onConnect = () => {
              if (!connectionResolved) {
                connectionResolved = true;
                clearTimeout(connectionTimeout);
                socket.off("connect", onConnect);
                socket.off("connect_error", onError);
                resolve();
              }
            };
            
            const onError = () => {
              // Silent - socket.io handles retries automatically
              // Don't spam console with errors
            };
            
            socket.on("connect", onConnect);
            socket.on("connect_error", onError);
          });
        }

        if (!mounted) {
          return;
        }

        // Check WebRTC support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("WebRTC is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.");
        }

        // Adaptive video constraints based on device capabilities
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const videoConstraints = isMobile
          ? {
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 },
              facingMode: "user",
            }
          : {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            };

        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);

        console.log("🎥 Media stream obtained, initializing WebRTC...");
        // Get userName and meetingTitle for WebRTC
        const currentUserName = userName || sessionStorage.getItem("userName") || `User-${Date.now()}`;
        const currentMeetingTitle = meetingTitle || sessionStorage.getItem("meetingTitle") || null;
        
        // Send meeting title to server if creating new room
        // Check if this is a new room (has meeting title in sessionStorage but hasn't joined yet)
        const hasJoined = sessionStorage.getItem(`hasJoinedRoom_${roomId}`);
        if (currentMeetingTitle && !hasJoined) {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          socket.emit("join-room", roomId, currentUserName, currentMeetingTitle);
          sessionStorage.setItem(`hasJoinedRoom_${roomId}`, "true");
        } else if (!hasJoined) {
          // Join without title (joining existing room)
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          socket.emit("join-room", roomId, currentUserName);
          sessionStorage.setItem(`hasJoinedRoom_${roomId}`, "true");
        }
        
        // Initialize WebRTC connections
        cleanup = await initWebRTC(roomId, stream, setPeers, setMySocketId, currentUserName);
        
        if (mounted) {
          setIsConnected(true);
          setIsLoading(false);
          console.log("✅ WebRTC initialized");
        }
      } catch (error: any) {
        console.error("❌ Error setting up media/WebRTC:", error);
        if (mounted) {
          setIsLoading(false);
          if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
            toast.error("Please allow camera and microphone access to join the room");
          } else {
            toast.error(`Error: ${error.message || "Failed to setup media"}`);
          }
        }
      }
    };

    setupMedia();

    return () => {
      console.log("🧹 Cleaning up room page");
      mounted = false;
      if (cleanup) {
        cleanup();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setLocalStream(null);
      setPeers(new Map());
      // Clear session storage for this room
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`hasJoinedRoom_${roomId}`);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userName]);

  // Show meeting ended screen if meeting has ended
  if (meetingEnded) {
    return <MeetingEnded message="The host has left the meeting" />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex flex-col overflow-hidden">
      {/* Header - Responsive */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent whitespace-nowrap">
              Study Room
            </h1>
            {meetingTitle && (
              <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50 max-w-[150px] sm:max-w-xs truncate">
                <p className="text-xs sm:text-sm text-gray-300 font-medium truncate" title={meetingTitle}>
                  {meetingTitle}
                </p>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isConnected 
                    ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" 
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-300 font-medium whitespace-nowrap">
                {isConnected ? "Connected" : "Connecting..."}
              </span>
            </div>
            <p className="hidden md:block text-xs text-gray-400 font-mono bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50 truncate max-w-[120px]">
              {roomId}
            </p>
            <button
              onClick={copyShareLink}
              className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-all duration-200 flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg border border-zinc-700/50 hover:border-blue-500/50 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Icon name="check" size={14} className="text-green-400" />
                  <span className="text-green-400 hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Icon name="copy" size={14} />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {isHost && (
              <button
                onClick={handleEndMeeting}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 whitespace-nowrap"
                title="End meeting for all participants"
              >
                <span className="hidden sm:inline">End Meeting</span>
                <span className="sm:hidden">End</span>
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 whitespace-nowrap"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400 text-sm">Setting up your connection...</p>
          </div>
        </div>
      )}

      {/* Main Content: Responsive layout - full width on mobile, split on desktop */}
      {!isLoading && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden animate-in fade-in duration-500">
          {/* Video Grid - Full width on mobile, 80% on desktop */}
          <div className="w-full lg:w-[80%] bg-gradient-to-br from-zinc-950 to-black p-2 sm:p-4">
            <VideoGrid
              peers={peers}
              localStream={localStream}
              mySocketId={mySocketId}
              participants={participants}
              userName={userName}
            />
          </div>

          {/* Sidebar - Hidden on mobile (can be toggled), visible on desktop */}
          <div className="hidden lg:block w-[20%] min-w-[300px]">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
}
