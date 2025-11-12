"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

interface JoinRoomProps {
  roomId: string;
  setRoomId: (id: string) => void;
  onCreateRoom: (name: string, title: string) => void;
  onJoinRoom: (name: string) => void;
}

export default function JoinRoom({
  roomId,
  setRoomId,
  onCreateRoom,
  onJoinRoom,
}: JoinRoomProps) {
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateRoom = () => {
    if (userName.trim() && meetingTitle.trim()) {
      setIsCreating(true);
      onCreateRoom(userName.trim(), meetingTitle.trim());
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim() && userName.trim()) {
      onJoinRoom(userName.trim());
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black rounded-2xl shadow-2xl p-8 max-w-md w-full border border-zinc-800/50 backdrop-blur-sm">
      <div className="space-y-6">
        {/* Create Room Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Create New Meeting</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meeting Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g., Study Session - Math"
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={100}
            />
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={!userName.trim() || !meetingTitle.trim() || isCreating}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Meeting"}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-zinc-900 text-gray-500 font-medium">or</span>
          </div>
        </div>

        {/* Join Room Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Join Meeting</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room ID or Link
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
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleJoinRoom();
                }
              }}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={!roomId.trim() || !userName.trim()}
            className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 text-white font-semibold py-3.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 border border-zinc-700/50"
          >
            Join Meeting
          </button>

          {roomId.trim() && (
            <button
              onClick={copyToClipboard}
              className="w-full text-sm text-blue-400 hover:text-blue-300 font-medium py-2 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Icon name="check" size={14} className="text-green-400" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Icon name="copy" size={14} />
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
