"use client";

import { memo } from "react";
import { useRoomStore, SidebarTab } from "@/store/roomStore";
import Icon from "@/components/ui/Icon";
import {
  toggleAudio,
  toggleScreenShare,
  toggleVideo,
} from "@/lib/mediaControls";

interface MediaControlsProps {
  onLeave: () => void;
}

const MediaControls = memo(function MediaControls({
  onLeave,
}: MediaControlsProps) {
  const {
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    networkStats,
    setSidebarTab,
    setSidebarVisible,
    sidebarVisible,
  } = useRoomStore();

  const controls = [
    {
      id: "mic",
      active: isAudioEnabled,
      label: isAudioEnabled ? "Mute microphone" : "Unmute microphone",
      icon: isAudioEnabled ? "mic" : "mic-off",
      onClick: toggleAudio,
    },
    {
      id: "video",
      active: isVideoEnabled,
      label: isVideoEnabled ? "Disable camera" : "Enable camera",
      icon: isVideoEnabled ? "video" : "video-off",
      onClick: toggleVideo,
    },
    {
      id: "screen",
      active: isScreenSharing,
      label: isScreenSharing ? "Stop screen share" : "Start screen share",
      icon: isScreenSharing ? "monitor-stop" : "monitor",
      onClick: toggleScreenShare,
    },
  ];

  const sidebarButtons: { id: string; icon: string; label: string; tab: SidebarTab }[] = [
    { id: "chat", icon: "chat", label: "Chat", tab: "chat" },
    { id: "participants", icon: "users", label: "Participants", tab: "participants" },
    { id: "details", icon: "settings", label: "Settings", tab: "details" },
  ];

  const handleSidebar = (tab: SidebarTab) => {
    setSidebarTab(tab);
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="pointer-events-none fixed bottom-0 inset-x-0 flex flex-col items-center justify-end z-40 pb-4 sm:pb-6 px-4">
      {/* Compact fixed width container */}
      <div className="pointer-events-auto w-full max-w-xl">
        <div className="relative rounded-2xl border border-white/20 bg-black/60 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          
          {/* Main controls container - more compact */}
          <div className="relative z-10 px-4 py-3 flex items-center justify-between gap-3">
            {/* Left: Media Controls */}
            <div className="flex items-center gap-2">
              {controls.map((control) => (
                <button
                  key={control.id}
                  onClick={control.onClick}
                  className={`relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    control.active
                      ? "bg-white/15 border border-white/30 text-white shadow-lg shadow-white/5"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                  aria-pressed={control.active}
                  aria-label={control.label}
                  title={control.label}
                >
                  <Icon name={control.icon} size={20} className="relative z-10" />
                  <span className="sr-only">{control.label}</span>
                </button>
              ))}
            </div>

            {/* Center: Leave Button */}
            <button
              onClick={onLeave}
              className="relative h-10 sm:h-11 px-6 rounded-xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all duration-200 font-bold text-sm tracking-wide group"
              aria-label="Leave meeting"
              title="Leave meeting"
            >
              <Icon name="power" size={18} className="transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">End</span>
            </button>

            {/* Right: Sidebar Buttons */}
            <div className="flex items-center gap-2">
              {sidebarButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleSidebar(button.tab)}
                  className={`relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    sidebarVisible && button.tab === useRoomStore.getState().sidebarTab
                      ? "bg-white/15 border border-white/30 text-white shadow-lg shadow-white/5"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label={button.label}
                  title={button.label}
                >
                  <Icon name={button.icon} size={18} className="relative z-10" />
                  <span className="sr-only">{button.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom: Compact Network Stats */}
          <div className="relative z-10 px-4 py-1.5 border-t border-white/10 bg-black/40 hidden sm:block">
            <div className="flex items-center justify-center gap-4 text-[10px] font-medium tracking-wide">
              <div className="flex items-center gap-1.5">
                <Icon name="activity" size={10} className="text-blue-400" />
                <span className="text-gray-400">Bitrate:</span>
                <span className="text-white font-mono">
                  {networkStats.bitrate ? `${networkStats.bitrate} kbps` : "—"}
                </span>
              </div>
              
              <div className="h-3 w-px bg-white/10"></div>
              
              <div className="flex items-center gap-1.5">
                <Icon name="zap" size={10} className="text-green-400" />
                <span className="text-gray-400">RTT:</span>
                <span className={`font-mono ${
                  networkStats.rtt && networkStats.rtt < 100 ? 'text-green-400' : 
                  networkStats.rtt && networkStats.rtt < 200 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {networkStats.rtt ? `${networkStats.rtt} ms` : "—"}
                </span>
              </div>
              
              <div className="h-3 w-px bg-white/10"></div>
              
              <div className="flex items-center gap-1.5">
                <Icon name="wifi" size={10} className="text-purple-400" />
                <span className="text-gray-400">Jitter:</span>
                <span className="text-white font-mono">
                  {networkStats.jitter ? `${(networkStats.jitter * 1000).toFixed(1)} ms` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MediaControls;