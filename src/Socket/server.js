let io = null;
const { Server } = require("socket.io");
const { customError } = require("../utils/customError");

module.exports = {
  initSocket: (hostServer) => {
    io = new Server(hostServer, {
      cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
      },
    });

    // connection
    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId;
      console.log("A user is connected", userId);

      if (userId) {
        socket.join(userId);
      }

      socket.on("disconnect", () => {
        console.log("A client is disconnected", socket.id);
      });
    });

    // error
    io.on("error", (error) => {
      console.log("error form socket", error);
      throw new customError(500, "Socket.IO error", error.message);
    });
  },
  getIo: () => {
    if (!io) {
      throw new customError(500, "Socket.IO not initialized");
    }
    return io;
  },
};
