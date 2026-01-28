import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

// Extend ServerResponse to include socket server
interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

// In-memory storage for rooms
const rooms = new Map();

// Helper function to generate a 6-digit room code
function generateRoomCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

// Helper function to convert Room to RoomState (for client)
function roomToState(room: any) {
  return {
    code: room.code,
    users: room.users,
    votes: Object.fromEntries(room.votes),
    currentScale: room.currentScale,
    votesRevealed: room.votesRevealed,
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');

    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['polling', 'websocket'],
      allowUpgrades: true,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Create a new room
      socket.on('create-room', (userName: string, callback: (code: string) => void) => {
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
      socket.on('join-room', (code: string, userName: string, callback: (success: boolean, room?: any) => void) => {
        const room = rooms.get(code);

        if (!room) {
          callback(false);
          socket.emit('error', 'Room not found');
          return;
        }

        const existingUser = room.users.find((u: any) => u.id === socket.id);
        if (!existingUser) {
          const user = { id: socket.id, name: userName };
          room.users.push(user);
        }

        socket.join(code);
        console.log(`${userName} (${socket.id}) joined room ${code}`);

        callback(true, roomToState(room));
        io.to(code).emit('room-update', roomToState(room));
      });

      // Leave a room
      socket.on('leave-room', (code: string, userId: string) => {
        const room = rooms.get(code);
        if (!room) return;

        room.users = room.users.filter((u: any) => u.id !== userId);
        room.votes.delete(userId);

        socket.leave(code);
        console.log(`User ${userId} left room ${code}`);

        if (room.users.length === 0) {
          rooms.delete(code);
          console.log(`Room ${code} deleted (empty)`);
        } else {
          io.to(code).emit('room-update', roomToState(room));
        }
      });

      // Submit a vote
      socket.on('vote', (code: string, userId: string, value: string) => {
        const room = rooms.get(code);
        if (!room) return;

        room.votes.set(userId, value);
        console.log(`User ${userId} voted ${value} in room ${code}`);

        io.to(code).emit('room-update', roomToState(room));
      });

      // Reveal all votes
      socket.on('reveal-votes', (code: string) => {
        const room = rooms.get(code);
        if (!room) return;

        room.votesRevealed = true;
        console.log(`Votes revealed in room ${code}`);

        io.to(code).emit('room-update', roomToState(room));
      });

      // Reset votes for a new round
      socket.on('reset-votes', (code: string) => {
        const room = rooms.get(code);
        if (!room) return;

        room.votes.clear();
        room.votesRevealed = false;
        console.log(`Votes reset in room ${code}`);

        io.to(code).emit('room-update', roomToState(room));
      });

      // Change voting scale
      socket.on('change-scale', (code: string, scale: string) => {
        const room = rooms.get(code);
        if (!room) return;

        room.currentScale = scale;
        console.log(`Scale changed to ${scale} in room ${code}`);

        io.to(code).emit('room-update', roomToState(room));
      });

      // Handle disconnection
      socket.on('disconnect', (reason: string) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);

        rooms.forEach((room, code) => {
          const userIndex = room.users.findIndex((u: any) => u.id === socket.id);
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

    console.log('Socket.IO server initialized');
  } else {
    console.log('Socket.IO server already running');
  }

  res.end();
}

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};
