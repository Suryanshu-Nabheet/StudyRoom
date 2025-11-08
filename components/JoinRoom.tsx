"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

interface JoinRoomProps {
  roomId: string;
  setRoomId: (id: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export default function JoinRoom({
  roomId,
  setRoomId,
  onCreateRoom,
  onJoinRoom,
}: JoinRoomProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (roomId.trim()) {
      const shareUrl = `${window.location.origin}?token=${roomId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch((err) => {
        console.error("Failed to copy:", err);
      });
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl shadow-2xl p-8 max-w-md w-full border border-zinc-800">
      <div className="space-y-6">
        <button
          onClick={onCreateRoom}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 shadow-lg"
        >
          Create New Room
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-zinc-900 text-gray-500 font-medium">or</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room ID or Token
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => {
                let value = e.target.value;
                // Extract room ID from full URL if pasted
                if (value.includes("?token=")) {
                  value = value.split("?token=")[1]?.split("&")[0] || value;
                } else if (value.includes("/room/")) {
                  value = value.split("/room/")[1]?.split("?")[0] || value;
                }
                setRoomId(value);
              }}
              placeholder="Enter Room ID or paste share link"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onJoinRoom();
                }
              }}
            />
          </div>
          <button
            onClick={onJoinRoom}
            disabled={!roomId.trim()}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 border border-zinc-700"
          >
            Join Room
          </button>
          {roomId.trim() && (
            <button
              onClick={copyToClipboard}
              className="w-full text-sm text-blue-400 hover:text-blue-300 font-medium py-2 transition-colors"
            >
              {copied ? (
                <>
                  <Icon name="check" size={14} className="inline mr-1 text-green-400" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Icon name="copy" size={14} className="inline mr-1" />
                  Copy Share Link
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
