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
const roomMetadata = new Map(); // roomId -> { title, createdAt, hostId }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  users.set(socket.id, { roomId: null, username: `User-${socket.id.slice(0, 6)}` });

  socket.on("join-room", (roomId, username, meetingTitle) => {
    try {
      // Leave previous room if any
      const userData = users.get(socket.id);
      if (userData && userData.roomId && userData.roomId !== roomId) {
        leaveRoom(socket, userData.roomId);
      }

      socket.join(roomId);
      
      const isNewRoom = !rooms.has(roomId);
      
      if (isNewRoom) {
        rooms.set(roomId, new Set());
        // First user to join becomes the host
        roomMetadata.set(roomId, {
          title: meetingTitle || null,
          createdAt: new Date(),
          hostId: socket.id, // First user is the host
        });
        console.log(`🏠 Room ${roomId} created. Host: ${socket.id} (${username})`);
      }
      
      const room = rooms.get(roomId);
      const otherUsers = Array.from(room);
      const metadata = roomMetadata.get(roomId);
      
      // Add user to room
      room.add(socket.id);
      users.set(socket.id, { roomId, username: username || `User-${socket.id.slice(0, 6)}` });
      
      console.log(`User ${socket.id} (${username}) joined room ${roomId}. Room now has ${room.size} users.`);
      
      // Send room metadata to the new user (including host status)
      if (metadata) {
        const isHost = metadata.hostId === socket.id;
        socket.emit("room-metadata", {
          ...metadata,
          isHost,
        });
      }
      
      // Send list of existing users to the new user (with host info)
      socket.emit("room-users", otherUsers.map(id => ({
        id,
        username: users.get(id)?.username || `User-${id.slice(0, 6)}`,
        isHost: metadata?.hostId === id,
      })));
      
      // Notify others in the room about the new user
      socket.to(roomId).emit("user-joined", {
        id: socket.id,
        username: users.get(socket.id)?.username || `User-${socket.id.slice(0, 6)}`,
        isHost: metadata?.hostId === socket.id,
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

  // Remove participant (host only)
  socket.on("remove-participant", (targetSocketId) => {
    try {
      const userData = users.get(socket.id);
      if (!userData || !userData.roomId) {
        socket.emit("error", { message: "You are not in a room" });
        return;
      }

      const metadata = roomMetadata.get(userData.roomId);
      if (!metadata || metadata.hostId !== socket.id) {
        socket.emit("error", { message: "Only the host can remove participants" });
        return;
      }

      if (targetSocketId === socket.id) {
        socket.emit("error", { message: "You cannot remove yourself" });
        return;
      }

      const targetUser = users.get(targetSocketId);
      if (!targetUser || targetUser.roomId !== userData.roomId) {
        socket.emit("error", { message: "Participant not found in this room" });
        return;
      }

      console.log(`🚫 Host ${socket.id} removing participant ${targetSocketId} from room ${userData.roomId}`);
      
      // Notify the target user they've been removed
      io.to(targetSocketId).emit("participant-removed", {
        message: "You have been removed from the meeting by the host",
      });

      // Remove them from the room
      leaveRoom(io.sockets.sockets.get(targetSocketId), userData.roomId);
      
      // Notify host of success
      socket.emit("participant-removed-success", { targetSocketId });
      
    } catch (error) {
      console.error("Error in remove-participant:", error);
      socket.emit("error", { message: "Failed to remove participant" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const userData = users.get(socket.id);
    if (userData && userData.roomId) {
      const metadata = roomMetadata.get(userData.roomId);
      const isHost = metadata?.hostId === socket.id;
      
      if (isHost) {
        // Host left - end meeting for all participants
        console.log(`🏠 Host ${socket.id} left room ${userData.roomId}. Ending meeting for all participants.`);
        const room = rooms.get(userData.roomId);
        if (room) {
          // Notify all participants that meeting ended
          socket.to(userData.roomId).emit("meeting-ended", {
            message: "The host has left the meeting",
          });
        }
      }
      
      leaveRoom(socket, userData.roomId);
    }
    users.delete(socket.id);
  });

  function leaveRoom(socket, roomId) {
    const room = rooms.get(roomId);
    if (room && socket) {
      room.delete(socket.id);
      socket.to(roomId).emit("user-left", socket.id);
      
      if (room.size === 0) {
        rooms.delete(roomId);
        roomMetadata.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        console.log(`User ${socket.id} left room ${roomId}. Room now has ${room.size} users.`);
      }
    }
  }
});

console.log("Socket.io signaling server running on port 3001");
