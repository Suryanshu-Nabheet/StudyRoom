"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/50 px-6 py-4 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20" />
        <h1 className="text-lg font-bold tracking-tight text-white md:text-xl">
          Study Room
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push("/login")}
          className="hidden text-sm font-medium text-gray-400 hover:text-white transition-colors sm:block"
        >
          Sign In
        </button>
        <button 
          onClick={() => router.push("/signup")}
          className="transform rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-200 shadow-lg shadow-white/10"
        >
          Get Started
        </button>
      </div>
    </motion.nav>
  );
}
