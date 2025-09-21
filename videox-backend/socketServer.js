const { verifyTokenSocket } = require("./middleware/authSocket");
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");
const disconnectHandler = require("./socketHandlers/disconnectHandler");
const serverStore = require("./serverStore")
const registerSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*", // change to your frontend URL in production
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  serverStore.setSocketServerInstance(io);   
  // JWT auth middleware
  io.use((socket, next) => verifyTokenSocket(socket, next));

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle new connection
    newConnectionHandler(socket, io);

    // Handle disconnect
    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });
  });
};

module.exports = { registerSocketServer };
