"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoGrid from "@/components/VideoGrid";
import Sidebar from "@/components/Sidebar";
import Icon from "@/components/Icon";
import { useRoomStore } from "@/store/roomStore";
import { initWebRTC } from "@/lib/webrtc";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const {
    peers,
    localStream,
    mySocketId,
    setRoomId,
    setLocalStream,
    setPeers,
    setMySocketId,
  } = useRoomStore();
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set room ID in store
  useEffect(() => {
    if (roomId) {
      setRoomId(roomId);
    }
  }, [roomId, setRoomId]);

  // Monitor socket connection
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

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      if (socket.connected) {
        setIsConnected(true);
        setIsLoading(false);
      }

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      };
    };

    initSocket();
  }, []);

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}?token=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        
        // Wait for socket to connect
        if (!socket.connected) {
          console.log("⏳ Waiting for socket connection...");
          await new Promise((resolve) => {
            if (socket.connected) {
              resolve(undefined);
            } else {
              const timeout = setTimeout(() => resolve(undefined), 10000);
              socket.once("connect", () => {
                clearTimeout(timeout);
                resolve(undefined);
              });
            }
          });
        }

        if (!socket.connected || !mounted) {
          throw new Error("Socket connection timeout");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);

        console.log("🎥 Media stream obtained, initializing WebRTC...");
        // Initialize WebRTC connections
        cleanup = await initWebRTC(roomId, stream, setPeers, setMySocketId);
        
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
            alert("Please allow camera and microphone access to join the room");
          } else {
            alert(`Error: ${error.message || "Failed to setup media"}`);
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return (
    <div className="h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 px-6 py-4 flex-shrink-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Study Room
            </h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isConnected 
                    ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" 
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-300 font-medium">
                {isConnected ? "Connected" : "Connecting..."}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50">
              {roomId}
            </p>
            <button
              onClick={copyShareLink}
              className="text-sm text-blue-400 hover:text-blue-300 transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg border border-zinc-700/50 hover:border-blue-500/50"
            >
              {copied ? (
                <>
                  <Icon name="check" size={14} className="text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Icon name="copy" size={14} />
                  Share
                </>
              )}
            </button>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
          >
            Leave
          </button>
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

      {/* Main Content: 80% Video Grid, 20% Sidebar */}
      {!isLoading && (
        <div className="flex-1 flex overflow-hidden animate-in fade-in duration-500">
          {/* Video Grid - 80% */}
          <div className="w-[80%] bg-gradient-to-br from-zinc-950 to-black p-4">
            <VideoGrid
              peers={peers}
              localStream={localStream}
              mySocketId={mySocketId}
            />
          </div>

          {/* Sidebar - 20% */}
          <div className="w-[20%] min-w-[300px]">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
}
