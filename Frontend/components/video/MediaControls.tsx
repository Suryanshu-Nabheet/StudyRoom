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
    { id: "chat", icon: "chat", label: "Open chat", tab: "chat" },
    { id: "participants", icon: "users", label: "Participant list", tab: "participants" },
    { id: "details", icon: "settings", label: "Meeting settings", tab: "details" },
  ];

  const handleSidebar = (tab: SidebarTab) => {
    setSidebarTab(tab);
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 inset-x-0 flex justify-center px-4 z-40">
      <div className="pointer-events-auto flex items-center gap-3.5 rounded-2xl border border-white/10 bg-gradient-to-b from-black/80 to-black/90 px-4 py-2.5 shadow-2xl shadow-black/40 backdrop-blur-xl max-w-fit justify-center">
        {/* Media Controls */}
        <div className="flex items-center gap-2.5">
          {controls.map((control) => (
            <button
              key={control.id}
              onClick={control.onClick}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                control.active
                  ? "bg-white/15 border border-white/20 text-white shadow-lg shadow-white/5"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20"
              }`}
              aria-pressed={control.active}
              aria-label={control.label}
              title={control.label}
            >
              <Icon name={control.icon} size={17} />
              <span className="sr-only">{control.label}</span>
            </button>
          ))}
          
          {/* Leave Button */}
          <button
            onClick={onLeave}
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/25 transition-all duration-200 hover:shadow-red-500/40 ml-1"
            aria-label="Leave meeting"
            title="Leave meeting"
          >
            <Icon name="power" size={17} />
            <span className="sr-only">Leave meeting</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/10" aria-hidden="true" />

        {/* Sidebar Buttons */}
        <div className="flex items-center gap-2">
          {sidebarButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => handleSidebar(button.tab)}
              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200"
              aria-label={button.label}
              title={button.label}
            >
              <Icon name={button.icon} size={16} />
              <span className="sr-only">{button.label}</span>
            </button>
          ))}
        </div>

        {/* Network Stats */}
        <div className="hidden lg:flex items-center gap-3 pl-3 ml-2 border-l border-white/10">
          <div className="text-center min-w-[60px]">
            <p className="text-[9px] font-medium uppercase tracking-wider text-gray-500 mb-0.5">
              Bitrate
            </p>
            <p className="text-xs font-semibold text-gray-200">
              {networkStats.bitrate ? `${networkStats.bitrate}` : "—"}
              {networkStats.bitrate && <span className="text-[10px] text-gray-400 ml-0.5">kbps</span>}
            </p>
          </div>
          <div className="text-center min-w-[50px]">
            <p className="text-[9px] font-medium uppercase tracking-wider text-gray-500 mb-0.5">
              RTT
            </p>
            <p className="text-xs font-semibold text-gray-200">
              {networkStats.rtt ? `${networkStats.rtt}` : "—"}
              {networkStats.rtt && <span className="text-[10px] text-gray-400 ml-0.5">ms</span>}
            </p>
          </div>
          <div className="text-center min-w-[50px]">
            <p className="text-[9px] font-medium uppercase tracking-wider text-gray-500 mb-0.5">
              Jitter
            </p>
            <p className="text-xs font-semibold text-gray-200">
              {networkStats.jitter
                ? `${(networkStats.jitter * 1000).toFixed(1)}`
                : "—"}
              {networkStats.jitter && <span className="text-[10px] text-gray-400 ml-0.5">ms</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MediaControls;