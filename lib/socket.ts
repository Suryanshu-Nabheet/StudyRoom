import { io, Socket } from "socket.io-client";
import { env } from "@/config/env";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = env.SOCKET_URL;
    console.log("🔌 Initializing socket connection to:", socketUrl);
    
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 30000, // Increased timeout
      forceNew: false,
      upgrade: true,
      rememberUpgrade: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      console.error("Make sure the signaling server is running on", socketUrl);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Reconnection attempt", attemptNumber);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
