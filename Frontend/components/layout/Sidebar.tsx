"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import ChatPanel from "@/components/chat/ChatPanel";
import ConnectionStatus from "@/components/ui/ConnectionStatus";
import { useRoomStore, SidebarTab } from "@/store/roomStore";
import { getSocket } from "@/lib/socket";
import { toast } from "@/components/ui/toast";

interface SidebarProps {
  compact?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ compact = false, onClose }: SidebarProps) {
  const [removing, setRemoving] = useState<string | null>(null);
  const {
    peers,
    mySocketId,
    roomId,
    meetingTitle,
    userName,
    participants,
    isHost,
    sidebarTab,
    setSidebarTab,
    setSidebarVisible,
  } = useRoomStore();

  const handleRemoveParticipant = (targetSocketId: string) => {
    if (!isHost || !targetSocketId || targetSocketId === mySocketId) return;
    
    const participant = participants.get(targetSocketId);
    const participantName = participant?.username || "Participant";
    
    setRemoving(targetSocketId);
    const socket = getSocket();
    socket.emit("remove-participant", targetSocketId);
    
    // Show toast notification
    toast.info(`Removing ${participantName}...`);
    
    // Listen for success
    socket.once("participant-removed-success", () => {
      toast.success(`Removed ${participantName} from the meeting`);
    });
    
    // Reset removing state after a delay
    setTimeout(() => setRemoving(null), 2000);
  };

  const tabs: { id: SidebarTab; label: string; icon: string }[] = [
    { id: "chat", label: "Chat", icon: "chat" },
    { id: "participants", label: "Participants", icon: "users" },
    { id: "details", label: "Details", icon: "network" },
  ];

  const rootClass = compact
    ? "flex flex-col overflow-hidden w-[340px] max-h-[70vh] rounded-3xl bg-black/95 border border-blue-900/40 shadow-2xl backdrop-blur-lg"
    : "h-full flex flex-col bg-gradient-to-b from-zinc-900/95 to-black/95 backdrop-blur-xl border-l border-zinc-800/50 shadow-2xl overflow-hidden";

  return (
    <div className={rootClass}>
      {compact && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-blue-900/30">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Room</h3>
            <span className="text-xs text-blue-400/80">{roomId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onClose) onClose();
                else setSidebarVisible(false);
              }}
              className="text-gray-400 hover:text-white p-1"
              aria-label="Close sidebar"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Tab Bar */}
      <div className="flex border-b border-zinc-800/50 bg-zinc-900/50 flex-shrink-0">
        <div className="flex flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                sidebarTab === tab.id
                  ? "bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 text-white border-b-2 border-blue-500 shadow-lg shadow-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-zinc-800/30"
              }`}
            >
              <Icon
                name={tab.icon}
                size={16}
                className={`sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] ${
                  sidebarTab === tab.id ? "text-blue-400" : ""
                }`}
              />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setSidebarVisible(false)}
          className="lg:hidden px-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Hide sidebar"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {sidebarTab === "chat" && <ChatPanel />}
        {sidebarTab === "participants" && (
          <div className="h-full overflow-y-auto p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Icon name="users" size={18} className="text-blue-400" />
              Participants ({peers.size + 1})
            </h3>
            <div className="space-y-2">
              {/* Local user */}
              <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 rounded-xl p-4 border border-zinc-700/50 shadow-lg hover:border-blue-500/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {mySocketId ? mySocketId.slice(0, 2).toUpperCase() : "ME"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {userName || "You"} {mySocketId && `(${mySocketId.slice(0, 8)})`}
                    </p>
                    <p className="text-xs text-gray-400">{isHost ? "Host" : "Participant"}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                </div>
              </div>
              {/* Other participants */}
              {Array.from(peers.entries())
                .filter(([userId]) => userId)
                .map(([userId], index) => {
                  const participant = participants.get(userId);
                  const displayName = participant?.username || userId.slice(0, 8);
                  const initials = participant?.username 
                    ? participant.username.slice(0, 2).toUpperCase()
                    : userId.slice(0, 2).toUpperCase();
                  const participantIsHost = participant?.isHost || false;
                  
                  return (
                    <div
                      key={userId}
                      className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 rounded-xl p-4 border border-zinc-700/50 shadow-lg hover:border-green-500/50 transition-all duration-200 animate-in fade-in slide-in-from-right-4"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          {initials}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {participantIsHost ? "Host" : "Participant"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                          {isHost && !participantIsHost && (
                            <button
                              onClick={() => handleRemoveParticipant(userId)}
                              disabled={removing === userId}
                              className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove participant"
                            >
                              {removing === userId ? "Removing..." : "Remove"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        {sidebarTab === "details" && (
          <div className="h-full overflow-y-auto p-4">
            <ConnectionStatus />
            <div className="mt-4 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 rounded-xl p-4 border border-zinc-700/50 shadow-lg">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Icon name="network" size={16} className="text-blue-400" />
                Meeting Details
              </h3>
              <div className="space-y-3 text-sm">
                {meetingTitle && (
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-gray-400">Title:</span>
                    <span className="text-white font-medium text-xs bg-zinc-900/50 px-2 py-1 rounded truncate max-w-[150px]" title={meetingTitle}>
                      {meetingTitle}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                  <span className="text-gray-400">Room ID:</span>
                  <span className="text-white font-mono text-xs bg-zinc-900/50 px-2 py-1 rounded">{roomId || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                  <span className="text-gray-400">Total Participants:</span>
                  <span className="text-white font-semibold">{peers.size + 1}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Your ID:</span>
                  <span className="text-white font-mono text-xs bg-zinc-900/50 px-2 py-1 rounded">
                    {mySocketId ? mySocketId.slice(0, 8) : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
