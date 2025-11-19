"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import JoinRoom from "@/components/ui/JoinRoom";
import Icon from "@/components/ui/Icon";

const heroHighlights = ["1080p HD", "Zero installs", "WebRTC native"];

const featureCards = [
  {
    icon: "video",
    title: "Crystal HD video",
    detail: "Optimized 1080p streams with smart fallbacks so sessions stay sharp on every device.",
  },
  {
    icon: "chat",
    title: "Live collaboration",
    detail: "Realtime chat, host controls, and screen share baked into a single minimalist surface.",
  },
  {
    icon: "shield",
    title: "Production-grade stability",
    detail: "Stateless Socket.io signaling, resilient media handling, and instant teardown for privacy.",
  },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    const formatted = token.includes("/")
      ? token.split("/").pop() || token
      : token;
    setRoomId(formatted);
  }, [searchParams]);

  const createRoom = (name: string, title: string) => {
    const id = uuidv4();
    sessionStorage.setItem("userName", name);
    sessionStorage.setItem("meetingTitle", title);
    router.push(`/room/${id}`);
  };

  const joinRoom = (name: string) => {
    if (!roomId.trim()) return;
    sessionStorage.setItem("userName", name);
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.2),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_45%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <p className="text-xs uppercase tracking-[0.5em] text-blue-300/80">
              Study Room
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
              Study Room brings premium, distraction-free meetings to a clean black canvas.
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
              Launch a secure WebRTC room in seconds, share a link, and collaborate with studio-grade
              audio and video. No dashboards, no noise—just a refined experience built for teams who
              care about quality.
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.4em] text-gray-400">
              {heroHighlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 px-4 py-1 text-gray-300"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push(`/room/${uuidv4()}`)}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 transition-transform"
              >
                Start instant room
                <Icon name="arrow" size={16} />
              </button>
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors"
              >
                View features
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-blue-500/5 blur-3xl" />
            <div className="relative rounded-3xl border border-white/10 bg-[#050505] shadow-2xl shadow-blue-600/20">
              <JoinRoom
                roomId={roomId}
                setRoomId={setRoomId}
                onCreateRoom={createRoom}
                onJoinRoom={joinRoom}
              />
            </div>
          </motion.div>
        </section>

        <section id="features" className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-blue-300">Why teams use Study Room</p>
            <h2 className="text-3xl font-semibold mt-3">A minimal surface with enterprise polish.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4"
              >
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Icon name={feature.icon as any} size={18} />
                </div>
                <div>
                  <p className="text-lg font-semibold">{feature.title}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-blue-200">Ready when you are</p>
              <h3 className="text-2xl font-semibold mt-2">
                Clone, set env vars, run `npm run server` & `npm run dev`.
              </h3>
            </div>
            <button
              onClick={() => router.push(`/room/${uuidv4()}`)}
              className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
            >
              Open demo room
            </button>
          </div>
          <p className="text-sm text-gray-400">
            Study Room ships with a clean Next.js frontend, a lightweight Socket.io signaling server,
            and sensible defaults for HD WebRTC meetings. Extend it with your own auth, AI features, or
            deployment stack when you’re ready.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-300">
            {["Next.js 14", "Tailwind", "Framer Motion", "Socket.io", "Simple-Peer"].map((item) => (
              <span key={item} className="rounded-full border border-white/10 px-4 py-2">
                {item}
              </span>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 pt-6 text-sm text-gray-400 flex flex-wrap items-center justify-between gap-4">
          <p>Study Room · Premium black-label meeting experience.</p>
          <div className="flex gap-6">
            <a href="https://github.com" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="mailto:hello@studyroom.dev" className="hover:text-white transition-colors">
              Support
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

function HomeSkeleton() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-6xl space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-full" />
        <div className="h-[360px] bg-white/5 rounded-3xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 bg-white/5 rounded-2xl" />
          ))}
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
