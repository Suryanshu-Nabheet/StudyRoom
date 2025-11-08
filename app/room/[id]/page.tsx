"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoGrid from "@/components/VideoGrid";
import TranscriptPanel from "@/components/TranscriptPanel";
import SummaryCard from "@/components/SummaryCard";
import VoiceAssistant from "@/components/VoiceAssistant";
import ChatPanel from "@/components/ChatPanel";
import ConnectionStatus from "@/components/ConnectionStatus";
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
    transcripts,
    summary,
    setLocalStream,
    setPeers,
    addTranscript,
    setSummary,
    setMySocketId,
  } = useRoomStore();
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Debug logging
  useEffect(() => {
    const addDebug = (msg: string) => {
      setDebugInfo((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    // Monitor socket connection
    const initSocket = async () => {
      const { getSocket } = await import("@/lib/socket");
      const socket = getSocket();
      
      const onConnect = () => {
        setDebugInfo((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: Socket connected`]);
        setIsConnected(true);
      };
      
      const onDisconnect = () => {
        setDebugInfo((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: Socket disconnected`]);
        setIsConnected(false);
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      if (socket.connected) {
        setIsConnected(true);
        setDebugInfo((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: Socket already connected`]);
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

    const setupMedia = async () => {
      try {
        // First, ensure socket is initialized
        const { getSocket } = await import("@/lib/socket");
        const socket = getSocket();
        
        // Wait a bit for socket to connect if needed
        if (!socket.connected) {
          console.log("⏳ Waiting for socket connection...");
          await new Promise((resolve) => {
            if (socket.connected) {
              resolve(undefined);
            } else {
              socket.once("connect", () => resolve(undefined));
              // Timeout after 5 seconds
              setTimeout(() => resolve(undefined), 5000);
            }
          });
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        console.log("🎥 Media stream obtained, initializing WebRTC...");
        // Initialize WebRTC connections
        cleanup = await initWebRTC(roomId, stream, setPeers, addTranscript, setMySocketId);
        setIsConnected(true);
        console.log("✅ WebRTC initialized");
      } catch (error) {
        console.error("❌ Error setting up media/WebRTC:", error);
        alert("Please allow camera and microphone access");
      }
    };

    setupMedia();

    return () => {
      if (cleanup) {
        cleanup();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-white">
                  Study Room
                </h1>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-400">
                    {isConnected ? "Connected" : "Connecting..."}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-gray-400 font-mono bg-zinc-800 px-3 py-1.5 rounded border border-zinc-700">
                  {roomId}
                </p>
                <button
                  onClick={copyShareLink}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700"
                >
                  {copied ? (
                    <>
                      <Icon name="check" size={16} className="text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Icon name="copy" size={16} />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Leave
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Icon name="video" size={20} className="text-blue-400" />
                  Your Video
                </h2>
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video border border-zinc-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Icon name="users" size={20} className="text-blue-400" />
                  Participants ({peers.size})
                </h2>
                <VideoGrid peers={peers} />
              </div>
            </div>
            
            {/* Debug Info */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Debug Info</h3>
                <div className="text-xs text-gray-400 space-y-1 max-h-32 overflow-y-auto">
                  {debugInfo.map((info, idx) => (
                    <div key={idx}>{info}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ConnectionStatus />
            <ChatPanel />
            <TranscriptPanel transcripts={transcripts} />
            <SummaryCard summary={summary} />
            <VoiceAssistant text={summary || "No summary available yet"} />
          </div>
        </div>
      </div>
    </div>
  );
}

