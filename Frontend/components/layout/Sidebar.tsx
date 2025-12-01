"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    const participantName = participant || "Participant";

    setRemoving(targetSocketId);
    const socket = getSocket();
    socket.emit("remove-participant", targetSocketId);

    toast.info(`Removing ${participantName}...`);

    socket.once("participant-removed-success", () => {
      toast.success(`Removed ${participantName} from the meeting`);
    });

    setTimeout(() => setRemoving(null), 2000);
  };

  const tabs: { id: SidebarTab; label: string; icon: string }[] = [
    { id: "chat", label: "Chat", icon: "chat" },
    { id: "participants", label: "Participants", icon: "users" },
    { id: "details", label: "Details", icon: "network" },
  ];

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`h-full flex flex-col ${
        compact
          ? "bg-white/10 backdrop-blur-2xl border-l border-blue-200/30"
          : "bg-white/10 backdrop-blur-2xl"
      }`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between p-3 sm:p-4 border-b border-blue-200/30 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10"
      >
        <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
          {sidebarTab === "chat" && "Chat"}
          {sidebarTab === "participants" && "Participants"}
          {sidebarTab === "details" && "Details"}
        </h2>
        {compact && (
          <button
            onClick={() => {
              if (onClose) onClose();
              else setSidebarVisible(false);
            }}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Icon name="x" size={16} className="text-gray-500" />
          </button>
        )}
      </motion.div>

      {/* Tab Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-1 p-2 sm:p-3 border-b border-blue-200/30 bg-white/5"
      >
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onClick={() => setSidebarTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              sidebarTab === tab.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-white/20 text-gray-600 hover:bg-white/30"
            }`}
          >
            <Icon name={tab.icon} size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        key={sidebarTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex-1 overflow-hidden"
      >
        {sidebarTab === "chat" && <ChatPanel />}
        {sidebarTab === "participants" && (
          <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-3">
            {/* Participants List Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="users" size={14} className="text-blue-600" />
                Participants ({participants.size})
              </h3>
            </div>

            {/* Local User */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/20 backdrop-blur-sm border border-blue-200/30 rounded-xl p-2.5 sm:p-3 shadow-sm"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                    {(userName || "You").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                    {userName} (You)
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isHost && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
                        <Icon name="crown" size={10} />
                        Host
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">
                      {mySocketId ? mySocketId.slice(0, 6) : "..."}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Remote Participants */}
            <div className="space-y-2">
              {Array.from(participants.entries())
                .filter(([id]) => id !== mySocketId)
                .map(([id, userInfo], index) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-white/20 backdrop-blur-sm border border-blue-200/30 rounded-xl p-2.5 sm:p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                            {userInfo.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {userInfo.username}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {id.slice(0, 6)}
                          </p>
                        </div>
                      </div>
                      {isHost && (
                        <button
                          onClick={() => handleRemoveParticipant(id)}
                          disabled={removing === id}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-medium rounded transition-colors"
                        >
                          {removing === id ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {sidebarTab === "details" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full overflow-y-auto p-3 sm:p-4 space-y-3"
          >
            <div className="bg-white/20 backdrop-blur-sm border border-blue-200/30 rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="info" size={14} className="text-blue-600" />
                Meeting Details
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Room ID:</span>
                  <span className="text-gray-900 font-mono text-[10px]">
                    {(roomId || "Unknown").slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Title:</span>
                  <span className="text-gray-900 font-medium truncate max-w-[150px]">
                    {meetingTitle || "Untitled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Your Name:</span>
                  <span className="text-gray-900 font-medium">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="text-gray-900 font-medium">
                    {isHost ? "Host" : "Participant"}
                  </span>
                </div>
              </div>
            </div>
            <ConnectionStatus />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
