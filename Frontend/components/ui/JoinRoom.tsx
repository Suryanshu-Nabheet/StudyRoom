"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

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
    if (!roomId.trim()) return;
    const shareUrl = `${window.location.origin}?token=${roomId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const handleCreateRoom = () => {
    if (!userName.trim() || !meetingTitle.trim()) return;
    setIsCreating(true);
    onCreateRoom(userName.trim(), meetingTitle.trim());
  };

  const handleJoinRoom = () => {
    if (!roomId.trim() || !userName.trim()) return;
    onJoinRoom(userName.trim());
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7 space-y-6 shadow-xl shadow-blue-900/5">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-blue-600 font-semibold">
          Instant studio
        </p>
        <h2 className="text-xl font-semibold text-gray-900">
          Launch a premium session
        </h2>
        <p className="text-sm text-gray-500">
          Create or join a secure Study Room. No emails. No lobby waits.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-[0.3em]">
          Your name
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Avery Johnson"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          maxLength={50}
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-[0.3em]">
          Meeting title
        </label>
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="Linear Algebra Sprint"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          maxLength={100}
        />
        <button
          onClick={handleCreateRoom}
          disabled={!userName.trim() || !meetingTitle.trim() || isCreating}
          className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isCreating ? "Building room..." : "Create & invite"}
        </button>
      </div>

      <div className="border-t border-gray-100 pt-6 space-y-3">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-[0.3em]">
          Join with ID
        </label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => {
            let value = e.target.value.trim();
            if (value.includes("?token=")) {
              value = value.split("?token=")[1]?.split("&")[0] || value;
            } else if (value.includes("/room/")) {
              value = value.split("/room/")[1]?.split("?")[0] || value;
            }
            setRoomId(value);
          }}
          placeholder="Paste invitation link or ID"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleJoinRoom}
            disabled={!roomId.trim() || !userName.trim()}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Join room
          </button>
          <button
            onClick={copyToClipboard}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Icon name={copied ? "check" : "copy"} size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
