"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useRoomStore } from "@/store/roomStore";
import { getSocket } from "@/lib/socket";

export default function ChatPanel() {
  const { chatMessages, mySocketId, addChatMessage } = useRoomStore();
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const socket = getSocket();

    setIsConnected(socket.connected);

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("chat-message", (msg) => {
      addChatMessage(msg);
    });

    return () => {
      socket.off("chat-message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [addChatMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages]);

  const sendMessage = () => {
    if (message.trim() && isConnected) {
      const socket = getSocket();
      socket.emit("chat-message", { message: message.trim() });
      setMessage("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-blue-200/30 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg border border-blue-100">
              <Icon
                name="chat"
                size={16}
                className="sm:w-[18px] sm:h-[18px] text-blue-600"
              />
            </div>
            <span>Chat</span>
            {!isConnected && (
              <span className="text-[10px] sm:text-xs text-red-500 ml-1 sm:ml-2 flex items-center gap-0.5 sm:gap-1">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="hidden xs:inline">Disconnected</span>
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
            <Icon name="users" size={12} className="sm:w-3.5 sm:h-3.5" />
            <span>{chatMessages.length} messages</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2 sm:space-y-3 animate-in fade-in duration-500">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                <Icon
                  name="chat"
                  size={20}
                  className="sm:w-6 sm:h-6 text-gray-400"
                />
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-xs sm:text-sm font-medium">
                  No messages yet
                </p>
                <p className="text-gray-400 text-[10px] sm:text-xs">
                  Start the conversation!
                </p>
              </div>
            </div>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const isMyMessage = msg.userId === mySocketId;
            return (
              <div
                key={msg.id}
                className={`flex ${
                  isMyMessage ? "justify-end" : "justify-start"
                } animate-in slide-in-from-bottom-4 fade-in`}
                style={{
                  animationDelay: `${index * 20}ms`,
                  animationDuration: "300ms",
                }}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                    isMyMessage
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white/20 backdrop-blur-sm text-gray-900 border border-blue-200/30 rounded-bl-md"
                  }`}
                >
                  {!isMyMessage && (
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold">
                        {msg.username.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                        {msg.username}
                      </p>
                    </div>
                  )}
                  <p className="text-xs sm:text-sm leading-relaxed break-words">
                    {msg.message}
                  </p>
                  <div className="flex items-center justify-end gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                    <p
                      className={`text-[9px] sm:text-[10px] font-medium ${
                        isMyMessage ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {isMyMessage && (
                      <Icon
                        name="check"
                        size={10}
                        className="sm:w-3 sm:h-3 text-blue-100"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-blue-200/30 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10">
        <div className="flex gap-1.5 sm:gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="w-full bg-white/20 backdrop-blur-sm border-2 border-blue-200/30 focus:border-blue-500 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all duration-200"
            />
            {message.trim() && (
              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-xs text-gray-400 font-medium">
                {message.length}/500
              </div>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!isConnected || !message.trim()}
            className="group px-3 sm:px-5 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-105 disabled:hover:scale-100 flex items-center gap-1.5 sm:gap-2 touch-manipulation"
          >
            <Icon
              name="send"
              size={14}
              className="sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
            <span className="hidden xs:inline text-xs sm:text-sm">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
