"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import ChatPanel from "@/components/chat/ChatPanel";
import AdminPanel from "@/components/admin/AdminPanel";
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
    ...(isHost
      ? [{ id: "admin" as SidebarTab, label: "Admin", icon: "crown" }]
      : []),
    { id: "details", label: "Details", icon: "network" },
  ];

  const rootClass = compact
    ? "flex flex-col overflow-hidden w-full sm:w-[280px] md:w-[320px] lg:w-[340px] max-h-[85vh] sm:max-h-[75vh] rounded-2xl sm:rounded-3xl bg-white/95 border border-gray-200 shadow-2xl backdrop-blur-lg"
    : "h-full flex flex-col bg-white backdrop-blur-xl border-l border-gray-200 shadow-2xl overflow-hidden";

  return (
    <div className={rootClass}>
      {compact && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Room</h3>
            <span className="text-xs text-blue-600/80">{roomId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onClose) onClose();
                else setSidebarVisible(false);
              }}
              className="text-gray-500 hover:text-gray-900 p-1"
              aria-label="Close sidebar"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Tab Bar - Compact */}
      <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold transition-all duration-200 relative ${
                sidebarTab === tab.id
                  ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon
                name={tab.icon}
                size={16}
                className={sidebarTab === tab.id ? "text-blue-600" : ""}
              />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setSidebarVisible(false)}
          className="lg:hidden px-3 text-gray-500 hover:text-gray-900 transition-colors"
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
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="users" size={16} className="text-blue-600" />
              Participants ({peers.size + 1})
            </h3>
            <div className="space-y-2">
              {/* Local user - Compact card */}
              <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:border-blue-500/50 transition-all duration-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {mySocketId ? mySocketId.slice(0, 2).toUpperCase() : "ME"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {userName || "You"}{" "}
                      {mySocketId && `(${mySocketId.slice(0, 8)})`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isHost ? "Host" : "Participant"}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                </div>
              </div>
              {/* Other participants - Compact cards */}
              {Array.from(peers.entries())
                .filter(([userId]) => userId)
                .map(([userId], index) => {
                  const participant = participants.get(userId);
                  const displayName =
                    participant?.username || userId.slice(0, 8);
                  const initials = participant?.username
                    ? participant.username.slice(0, 2).toUpperCase()
                    : userId.slice(0, 2).toUpperCase();
                  const participantIsHost = participant?.isHost || false;

                  return (
                    <div
                      key={userId}
                      className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:border-green-500/50 transition-all duration-200 animate-in fade-in slide-in-from-right-4"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-xs font-bold shadow-md">
                          {initials}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {participantIsHost ? "Host" : "Participant"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                          {isHost && !participantIsHost && (
                            <button
                              onClick={() => handleRemoveParticipant(userId)}
                              disabled={removing === userId}
                              className="px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        {sidebarTab === "admin" && <AdminPanel />}
        {sidebarTab === "details" && (
          <div className="h-full overflow-y-auto p-5">
            <ConnectionStatus />
            <div className="mt-5 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="network" size={18} className="text-blue-600" />
                Meeting Details
              </h3>
              <div className="space-y-4 text-sm">
                {meetingTitle && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Title:</span>
                    <span
                      className="text-gray-900 font-semibold text-sm bg-gray-50 px-3 py-1.5 rounded truncate max-w-[180px]"
                      title={meetingTitle}
                    >
                      {meetingTitle}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Room ID:</span>
                  <span className="text-gray-900 font-mono text-xs bg-gray-50 px-3 py-1.5 rounded">
                    {roomId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">
                    Total Participants:
                  </span>
                  <span className="text-gray-900 font-bold text-base">
                    {peers.size + 1}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500 font-medium">Your ID:</span>
                  <span className="text-gray-900 font-mono text-xs bg-gray-50 px-3 py-1.5 rounded">
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
