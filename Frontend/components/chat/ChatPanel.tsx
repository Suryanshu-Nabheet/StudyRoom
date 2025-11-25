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
        behavior: 'smooth'
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
    <div className="h-full flex flex-col bg-gradient-to-b from-zinc-900/50 to-black/50">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/30">
              <Icon name="chat" size={18} className="text-blue-400" />
            </div>
            <span>Chat</span>
            {!isConnected && (
              <span className="text-xs text-red-400 ml-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                Disconnected
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Icon name="users" size={14} />
            <span>{chatMessages.length} messages</span>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3 animate-in fade-in duration-500">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700">
                <Icon name="chat" size={24} className="text-gray-500" />
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">No messages yet</p>
                <p className="text-gray-600 text-xs">Start the conversation!</p>
              </div>
            </div>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const isMyMessage = msg.userId === mySocketId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMyMessage ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 fade-in`}
                style={{ animationDelay: `${index * 20}ms`, animationDuration: '300ms' }}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] ${
                    isMyMessage
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
                      : "bg-gradient-to-br from-zinc-800 to-zinc-900 text-white border border-zinc-700/50 rounded-bl-md"
                  }`}
                >
                  {!isMyMessage && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {msg.username.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{msg.username}</p>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    <p className={`text-[10px] font-medium ${isMyMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {isMyMessage && (
                      <Icon name="check" size={12} className="text-blue-200" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="w-full bg-zinc-800/60 border-2 border-zinc-700/50 focus:border-blue-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all duration-200"
            />
            {message.trim() && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                {message.length}/500
              </div>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!isConnected || !message.trim()}
            className="group px-5 py-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
          >
            <Icon name="send" size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

