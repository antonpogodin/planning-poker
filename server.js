const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory storage for rooms
const rooms = new Map();

// Helper function to generate a 6-digit room code
function generateRoomCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

// Helper function to convert Room to RoomState (for client)
function roomToState(room) {
  return {
    code: room.code,
    users: room.users,
    votes: Object.fromEntries(room.votes),
    currentScale: room.currentScale,
    votesRevealed: room.votesRevealed,
  };
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6,
    allowEIO3: true
  });

  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err);
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}, transport: ${socket.conn.transport.name}`);

    // Create a new room
    socket.on('create-room', (userName, callback) => {
      const code = generateRoomCode();
      const user = { id: socket.id, name: userName };

      const room = {
        code,
        users: [user],
        votes: new Map(),
        currentScale: 'fibonacci',
        votesRevealed: false,
      };

      rooms.set(code, room);
      socket.join(code);

      console.log(`Room ${code} created by ${userName} (${socket.id})`);
      callback(code);
      socket.emit('room-joined', roomToState(room));
    });

    // Join an existing room
    socket.on('join-room', (code, userName, callback) => {
      const room = rooms.get(code);

      if (!room) {
        callback(false);
        socket.emit('error', 'Room not found');
        return;
      }

      // Check if user already in room (reconnection)
      const existingUser = room.users.find((u) => u.id === socket.id);
      if (!existingUser) {
        const user = { id: socket.id, name: userName };
        room.users.push(user);
      }

      socket.join(code);
      console.log(`${userName} (${socket.id}) joined room ${code}`);

      callback(true, roomToState(room));

      // Notify all users in the room about the update
      io.to(code).emit('room-update', roomToState(room));
    });

    // Leave a room
    socket.on('leave-room', (code, userId) => {
      const room = rooms.get(code);
      if (!room) return;

      room.users = room.users.filter((u) => u.id !== userId);
      room.votes.delete(userId);

      socket.leave(code);
      console.log(`User ${userId} left room ${code}`);

      // Delete room if empty
      if (room.users.length === 0) {
        rooms.delete(code);
        console.log(`Room ${code} deleted (empty)`);
      } else {
        io.to(code).emit('room-update', roomToState(room));
      }
    });

    // Submit a vote
    socket.on('vote', (code, userId, value) => {
      const room = rooms.get(code);
      if (!room) return;

      room.votes.set(userId, value);
      console.log(`User ${userId} voted ${value} in room ${code}`);

      io.to(code).emit('room-update', roomToState(room));
    });

    // Reveal all votes
    socket.on('reveal-votes', (code) => {
      const room = rooms.get(code);
      if (!room) return;

      room.votesRevealed = true;
      console.log(`Votes revealed in room ${code}`);

      io.to(code).emit('room-update', roomToState(room));
    });

    // Reset votes for a new round
    socket.on('reset-votes', (code) => {
      const room = rooms.get(code);
      if (!room) return;

      room.votes.clear();
      room.votesRevealed = false;
      console.log(`Votes reset in room ${code}`);

      io.to(code).emit('room-update', roomToState(room));
    });

    // Change voting scale
    socket.on('change-scale', (code, scale) => {
      const room = rooms.get(code);
      if (!room) return;

      room.currentScale = scale;
      console.log(`Scale changed to ${scale} in room ${code}`);

      io.to(code).emit('room-update', roomToState(room));
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);

      // Remove user from all rooms
      rooms.forEach((room, code) => {
        const userIndex = room.users.findIndex((u) => u.id === socket.id);
        if (userIndex !== -1) {
          room.users.splice(userIndex, 1);
          room.votes.delete(socket.id);

          if (room.users.length === 0) {
            rooms.delete(code);
            console.log(`Room ${code} deleted (empty after disconnect)`);
          } else {
            io.to(code).emit('room-update', roomToState(room));
          }
        }
      });
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
