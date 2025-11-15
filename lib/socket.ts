import { io, Socket } from "socket.io-client";
import { env } from "@/config/env";

let socket: Socket | null = null;
let connectionAttempts = 0;
const MAX_CONSOLE_ERRORS = 3; // Limit console spam

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = env.SOCKET_URL;
    console.log("🔌 Initializing socket connection to:", socketUrl);
    
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout: 20000, // 20 second timeout - reasonable for production
      forceNew: false,
      upgrade: true,
      rememberUpgrade: true,
      autoConnect: true,
    });

    socket.on("connect", () => {
      connectionAttempts = 0; // Reset on successful connection
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        // Server disconnected, reconnect manually
        socket?.connect();
      }
      // Only log important disconnects
      if (reason !== "transport close" && reason !== "ping timeout") {
      console.log("❌ Socket disconnected:", reason);
      }
    });

    socket.on("connect_error", (error) => {
      connectionAttempts++;
      // Limit console spam - only show first few errors
      if (connectionAttempts <= MAX_CONSOLE_ERRORS) {
        console.warn(`⚠️ Socket connection attempt ${connectionAttempts}:`, error.message);
        if (connectionAttempts === MAX_CONSOLE_ERRORS) {
          console.log("💡 Connection will continue retrying silently...");
        }
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      connectionAttempts = 0;
      console.log("✅ Socket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_attempt", () => {
      // Silent retry - don't spam console
    });

    socket.on("reconnect_error", () => {
      // Silent retry errors
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
