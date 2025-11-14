"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Icon from "@/components/Icon";
import JoinRoom from "@/components/JoinRoom";

function HomeContent() {
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

  const createRoom = (name: string, title: string) => {
    const newRoomId = uuidv4();
    // Store name and title in sessionStorage to pass to room page
    sessionStorage.setItem("userName", name);
    sessionStorage.setItem("meetingTitle", title);
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = (name: string) => {
    if (roomId.trim()) {
      // Store name in sessionStorage
      sessionStorage.setItem("userName", name);
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12 animate-in fade-in">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6">
            Study Room
          </h1>
          <p className="text-2xl text-gray-300 mb-3 font-light">
            Connect, collaborate, and study together
          </p>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            Premium peer-to-peer video meetings with real-time chat. No downloads, no sign-ups, just instant collaboration.
          </p>
        </div>
        
        <div className="flex justify-center mb-12">
          <JoinRoom
            roomId={roomId}
            setRoomId={setRoomId}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
          />
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-xl p-6 border border-zinc-800/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 group">
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
              <Icon name="video" size={36} className="text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2 text-lg">HD Video Calls</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crystal-clear peer-to-peer video and audio connections with low latency
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-xl p-6 border border-zinc-800/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 group">
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
              <Icon name="chat" size={36} className="text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2 text-lg">Real-time Chat</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Instant messaging during your meetings to share notes and ideas
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-xl p-6 border border-zinc-800/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 group">
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
              <Icon name="users" size={36} className="text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2 text-lg">Easy Collaboration</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Share meeting links instantly. No accounts required, just join and start
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function HomeSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-20 bg-zinc-800 rounded-lg mb-6"></div>
          <div className="h-8 bg-zinc-800 rounded-lg mb-3 max-w-xl mx-auto"></div>
          <div className="h-6 bg-zinc-800 rounded-lg max-w-2xl mx-auto"></div>
        </div>
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-md h-96 bg-zinc-800 rounded-2xl"></div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
