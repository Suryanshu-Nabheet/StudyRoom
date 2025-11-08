"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Icon from "@/components/Icon";
import JoinRoom from "@/components/JoinRoom";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState("");

  // Check for token in URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Extract room ID from token (could be full URL or just ID)
      const extractedId = token.includes("/") 
        ? token.split("/").pop() || token 
        : token;
      setRoomId(extractedId);
    }
  }, [searchParams]);

  const createRoom = () => {
    const newRoomId = uuidv4();
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            AI Study Rooms
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            Collaborate in real-time with AI-powered transcription
          </p>
          <p className="text-sm text-gray-500">
            Study together, get instant summaries, and never miss important points
          </p>
        </div>
        
        <div className="flex justify-center">
          <JoinRoom
            roomId={roomId}
            setRoomId={setRoomId}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
          />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="mb-4">
              <Icon name="video" size={32} className="text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Video Calls</h3>
            <p className="text-sm text-gray-400">
              High-quality peer-to-peer video and audio connections
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="mb-4">
              <Icon name="transcript" size={32} className="text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Live Transcription</h3>
            <p className="text-sm text-gray-400">
              Real-time AI transcription of your conversations
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="mb-4">
              <Icon name="brain" size={32} className="text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">AI Summaries</h3>
            <p className="text-sm text-gray-400">
              Automatic key insights and learning points
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

