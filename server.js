/**
 * Custom Next.js server with integrated Socket.io
 * This allows both Next.js and Socket.io to run on the same port (required for Render)
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io on the same HTTP server
  const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL 
    ? [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"]
    : "*";

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
    allowEIO3: true,
    connectTimeout: 45000,
  });

  // Initialize socket handlers directly
  initializeSocketHandlers(io);
  
  httpServer.listen(port, () => {
    console.log(`✅ Next.js server ready on http://${hostname}:${port}`);
    console.log(`✅ Socket.io server ready on the same port`);
  });
});

// Socket handlers - integrated directly into server.js
function initializeSocketHandlers(io) {
  const rooms = new Map();
  const users = new Map();
  const roomMetadata = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    users.set(socket.id, { roomId: null, username: `User-${socket.id.slice(0, 6)}` });

    socket.on('join-room', (roomId, username, meetingTitle) => {
      socket.join(roomId);
      const isNewRoom = !rooms.has(roomId);
      
      if (isNewRoom) {
        rooms.set(roomId, new Set());
        roomMetadata.set(roomId, {
          title: meetingTitle || null,
          createdAt: new Date(),
          hostId: socket.id,
        });
        console.log(`🏠 Room ${roomId} created. Host: ${socket.id} (${username})`);
      }

      const room = rooms.get(roomId);
      if (!room) {
        console.error(`Room ${roomId} not found after creation`);
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      room.add(socket.id);
      users.set(socket.id, { roomId, username: username || `User-${socket.id.slice(0, 6)}` });
      console.log(`User ${socket.id} (${username}) joined room ${roomId}. Room now has ${room.size} users.`);

      const metadata = roomMetadata.get(roomId);
      const otherUsers = Array.from(room).filter(id => id !== socket.id);
      
      if (metadata) {
        const isHost = metadata.hostId === socket.id;
        socket.emit('room-metadata', { ...metadata, isHost });
      }
      
      socket.emit('room-users', otherUsers.map(id => ({
        id,
        username: users.get(id)?.username || `User-${id.slice(0, 6)}`,
        isHost: metadata?.hostId === id,
      })));
      
      socket.to(roomId).emit('user-joined', {
        id: socket.id,
        username: users.get(socket.id)?.username || `User-${socket.id.slice(0, 6)}`,
        isHost: metadata?.hostId === socket.id,
      });
    });

    socket.on('signal', ({ to, signal }) => {
      if (to && signal) {
        io.to(to).emit('signal', { from: socket.id, signal });
      }
    });

    socket.on('chat-message', ({ message }) => {
      const userData = users.get(socket.id);
      if (userData && userData.roomId) {
        io.to(userData.roomId).emit('chat-message', {
          id: `${socket.id}-${Date.now()}`,
          userId: socket.id,
          username: userData.username,
          message,
          timestamp: new Date(),
        });
      }
    });

    socket.on('remove-participant', (targetSocketId) => {
      const userData = users.get(socket.id);
      if (!userData || !userData.roomId) {
        socket.emit('error', { message: 'You are not in a room' });
        return;
      }

      const metadata = roomMetadata.get(userData.roomId);
      if (!metadata || metadata.hostId !== socket.id) {
        socket.emit('error', { message: 'Only the host can remove participants' });
        return;
      }

      if (targetSocketId === socket.id) {
        socket.emit('error', { message: 'You cannot remove yourself' });
        return;
      }

      const targetUser = users.get(targetSocketId);
      if (!targetUser || targetUser.roomId !== userData.roomId) {
        socket.emit('error', { message: 'Participant not found in this room' });
        return;
      }

      console.log(`🚫 Host ${socket.id} removing participant ${targetSocketId} from room ${userData.roomId}`);
      io.to(targetSocketId).emit('participant-removed', {
        message: 'You have been removed from the meeting by the host',
      });

      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        const room = rooms.get(userData.roomId);
        if (room) {
          room.delete(targetSocketId);
          targetSocket.leave(userData.roomId);
          socket.to(userData.roomId).emit('user-left', targetSocketId);
        }
        users.delete(targetSocketId);
      }

      socket.emit('participant-removed-success', { targetSocketId });
    });

    socket.on('end-meeting', () => {
      const userData = users.get(socket.id);
      if (!userData || !userData.roomId) {
        socket.emit('error', { message: 'You are not in a room' });
        return;
      }

      const metadata = roomMetadata.get(userData.roomId);
      if (!metadata || metadata.hostId !== socket.id) {
        socket.emit('error', { message: 'Only the host can end the meeting' });
        return;
      }

      console.log(`🏁 Host ${socket.id} ended meeting in room ${userData.roomId}`);
      io.to(userData.roomId).emit('meeting-ended', {
        message: 'The host has ended the meeting',
      });

      socket.emit('meeting-ended-success', { message: 'Meeting ended successfully' });

      const room = rooms.get(userData.roomId);
      if (room) {
        room.forEach((socketId) => {
          const targetSocket = io.sockets.sockets.get(socketId);
          if (targetSocket) {
            const roomId = userData.roomId;
            const room = rooms.get(roomId);
            if (room) {
              room.delete(socketId);
              targetSocket.leave(roomId);
            }
            users.delete(socketId);
          }
        });
        rooms.delete(userData.roomId);
        roomMetadata.delete(userData.roomId);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      const userData = users.get(socket.id);
      if (userData && userData.roomId) {
        const roomId = userData.roomId;
        const metadata = roomMetadata.get(roomId);
        const isHost = metadata?.hostId === socket.id;

        if (isHost) {
          console.log(`🏠 Host ${socket.id} left room ${roomId}. Ending meeting for all participants.`);
          const room = rooms.get(roomId);
          if (room) {
            socket.to(roomId).emit('meeting-ended', {
              message: 'The host has left the meeting',
            });
          }
        }

        const room = rooms.get(roomId);
        if (room) {
          room.delete(socket.id);
          socket.to(roomId).emit('user-left', socket.id);

          if (room.size === 0) {
            rooms.delete(roomId);
            roomMetadata.delete(roomId);
            console.log(`Room ${roomId} deleted (empty)`);
          } else {
            console.log(`User ${socket.id} left room ${roomId}. Room now has ${room.size} users.`);
          }
        }
      }
      users.delete(socket.id);
    });
  });

  console.log('✅ Socket.io handlers initialized');
}
