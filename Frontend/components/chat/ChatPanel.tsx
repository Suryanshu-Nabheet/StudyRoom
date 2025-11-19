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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Icon name="chat" size={20} className="text-blue-400" />
          Chat
          {!isConnected && (
            <span className="text-xs text-gray-500 ml-2">(Disconnected)</span>
          )}
        </h2>
      </div>
      
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800"
      >
        {chatMessages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          chatMessages.map((msg) => {
            const isMyMessage = msg.userId === mySocketId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    isMyMessage
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-white border border-zinc-700"
                  }`}
                >
                  {!isMyMessage && (
                    <p className="text-xs text-gray-400 mb-1">{msg.username}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !message.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

