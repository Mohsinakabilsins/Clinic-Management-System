import { Server } from "socket.io";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" }
  });

  io.on("connection", socket => {
    socket.on("clinic:join", clinicId => socket.join(`clinic:${clinicId}`));
    socket.on("public:join", code => socket.join(`public:${code}`));
  });
}

export function emitQueue(clinicId, payload) {
  io?.to(`clinic:${clinicId}`).emit("queue:updated", payload);
}

export function emitPublic(code, payload) {
  io?.to(`public:${code}`).emit("queue:updated", payload);
}

export function emitClinic(clinicId, event, payload) {
  io?.to(`clinic:${clinicId}`).emit(event, payload);
}
