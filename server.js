const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const rooms = new Map(); // roomId -> Set of socketIds
const users = new Map(); // socketId -> { roomId, username }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  users.set(socket.id, { roomId: null, username: `User-${socket.id.slice(0, 6)}` });

  socket.on("join-room", (roomId, username) => {
    try {
      // Leave previous room if any
      const userData = users.get(socket.id);
      if (userData && userData.roomId && userData.roomId !== roomId) {
        leaveRoom(socket, userData.roomId);
      }

      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      
      const room = rooms.get(roomId);
      const otherUsers = Array.from(room);
      
      // Add user to room
      room.add(socket.id);
      users.set(socket.id, { roomId, username: username || `User-${socket.id.slice(0, 6)}` });
      
      console.log(`User ${socket.id} joined room ${roomId}. Room now has ${room.size} users.`);
      
      // Send list of existing users to the new user
      socket.emit("room-users", otherUsers.map(id => ({
        id,
        username: users.get(id)?.username || `User-${id.slice(0, 6)}`
      })));
      
      // Notify others in the room about the new user
      socket.to(roomId).emit("user-joined", {
        id: socket.id,
        username: users.get(socket.id)?.username || `User-${socket.id.slice(0, 6)}`
      });
      
    } catch (error) {
      console.error("Error in join-room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("signal", (data) => {
    try {
      if (data.to && data.signal) {
        io.to(data.to).emit("signal", {
          from: socket.id,
          signal: data.signal,
        });
      }
    } catch (error) {
      console.error("Error in signal:", error);
    }
  });

  // Chat functionality
  socket.on("chat-message", (data) => {
    try {
      const userData = users.get(socket.id);
      if (userData && userData.roomId) {
        const message = {
          id: `${socket.id}-${Date.now()}`,
          userId: socket.id,
          username: userData.username,
          message: data.message,
          timestamp: new Date(),
        };
        
        // Broadcast to all users in the room
        io.to(userData.roomId).emit("chat-message", message);
      }
    } catch (error) {
      console.error("Error in chat-message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const userData = users.get(socket.id);
    if (userData && userData.roomId) {
      leaveRoom(socket, userData.roomId);
    }
    users.delete(socket.id);
  });

  function leaveRoom(socket, roomId) {
    const room = rooms.get(roomId);
    if (room) {
      room.delete(socket.id);
      socket.to(roomId).emit("user-left", socket.id);
      
      if (room.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        console.log(`User ${socket.id} left room ${roomId}. Room now has ${room.size} users.`);
      }
    }
  }
});

console.log("Socket.io signaling server running on port 3001");

