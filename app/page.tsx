"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import JoinRoom from "@/components/ui/JoinRoom";

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
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="text-6xl lg:text-7xl font-bold leading-tight"
                  >
                    <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                      Premium Video
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Meetings
                    </span>
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-xl lg:text-2xl text-gray-400 font-light max-w-xl"
                  >
                    Connect, collaborate, and study together with crystal-clear peer-to-peer video meetings.
                  </motion.p>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-base text-gray-500 max-w-2xl"
                  >
                    No downloads, no sign-ups, just instant collaboration. Built for professionals who demand quality.
                  </motion.p>
                </div>

                {/* Feature Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex flex-wrap gap-3"
                >
                  {[
                    { icon: "video", text: "HD Video" },
                    { icon: "chat", text: "Real-time Chat" },
                    { icon: "users", text: "Unlimited Participants" },
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-full"
                    >
                      <Icon name={feature.icon as any} size={16} className="text-blue-400" />
                      <span className="text-sm text-gray-300">{feature.text}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right: Join/Create UI */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-center lg:justify-end"
              >
                <JoinRoom
                  roomId={roomId}
                  setRoomId={setRoomId}
                  onCreateRoom={createRoom}
                  onJoinRoom={joinRoom}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 pb-20 px-4">
          <div className="w-full max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: "video",
                  title: "HD Video Calls",
                  description: "Crystal-clear peer-to-peer video and audio connections with low latency and minimal buffering.",
                },
                {
                  icon: "chat",
                  title: "Real-time Chat",
                  description: "Instant messaging during your meetings to share notes, links, and ideas seamlessly.",
                },
                {
                  icon: "users",
                  title: "Easy Collaboration",
                  description: "Share meeting links instantly. No accounts required, just join and start collaborating.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-xl p-6 border border-zinc-800/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 group"
                >
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <Icon name={feature.icon as any} size={36} className="text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
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
