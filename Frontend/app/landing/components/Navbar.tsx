"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import RoomModal from "./RoomModal";

interface NavbarProps {
  onCreateRoom?: (name: string, title: string) => void;
  onJoinRoom?: (name: string) => void;
}

export default function Navbar({ onCreateRoom, onJoinRoom }: NavbarProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "join">("create");

  const openModal = (mode: "create" | "join") => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between 
        border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-xl"
      >
        {/* LEFT SECTION — Logo + Text */}
        <div className="flex items-center gap-3">
          
          {/* LOGO CONTAINER (MATCHED TO WEBMEET STYLE) */}
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 
          shadow-lg shadow-blue-400/20 p-[1px]">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <Image
                src="/favicon.svg"
                alt="Logo"
                width={32}
                height={32}
                className="h-[110%] w-[110%] object-contain"
              />
            </div>
          </div>

          <h1 className="text-lg font-bold tracking-tight text-gray-900 md:text-xl">
            StudyRoom
          </h1>
        </div>

        {/* RIGHT SECTION — Buttons */}
        <div className="flex items-center gap-3">

          {/* GHOST BUTTON (MIRRORING WEBMEET STYLE BUT WHITE THEME) */}
          <button
            onClick={() => openModal("create")}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-300 
            bg-white/40 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm
            hover:bg-white/60 transition-all duration-200 shadow-md shadow-gray-300/20"
          >
            Start Instant Room
          </button>

          {/* SOLID BUTTON (MATCHED ANIMATION + GLOW) */}
          <button
            onClick={() => openModal("join")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 
            text-sm font-medium text-white transition-all duration-300 
            hover:-translate-y-0.5 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          >
            Join Existing Room
          </button>
        </div>
      </motion.nav>

      {/* MODAL */}
      {isModalOpen && (
        <RoomModal
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
          onCreateRoom={(name, title) => {
            if (onCreateRoom) onCreateRoom(name, title);
            setIsModalOpen(false);
          }}
          onJoinRoom={(name) => {
            if (onJoinRoom) onJoinRoom(name);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}
