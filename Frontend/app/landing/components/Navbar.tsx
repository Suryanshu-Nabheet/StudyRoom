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
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.svg"
            alt="Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <h1 className="text-lg font-bold tracking-tight text-gray-900 md:text-xl">
            StudyRoom
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal("create")}
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            Start Instant Room
          </button>
          <button
            onClick={() => openModal("join")}
            className="transform rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          >
            Join Existing Room
          </button>
        </div>
      </motion.nav>

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
