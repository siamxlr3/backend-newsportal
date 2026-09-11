import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

// Map of userID -> socket.id, so we know which live connection
// belongs to which logged-in user.
const connectedUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
    },
  });

  // Auth handshake: client must send { auth: { token: "<JWT>" } } when connecting.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Invalid or expired token"));
      }
      socket.user = decoded; // { id, role }
      next();
    });
  });

  io.on("connection", (socket) => {
    connectedUsers.set(socket.user.id, socket.id);
    console.log(`Socket connected: user ${socket.user.id}`);

    socket.on("disconnect", () => {
      connectedUsers.delete(socket.user.id);
      console.log(`Socket disconnected: user ${socket.user.id}`);
    });
  });

  return io;
};

// Send to a specific user if they're currently connected.
// If they're offline, this simply does nothing — the DB row from
// notificationService still exists for them to see when they load
// their notifications list later.
export const emitToUser = (userId, event, payload) => {
  const socketId = connectedUsers.get(userId);

  if (socketId && io) {
    io.to(socketId).emit(event, payload);
  }
};