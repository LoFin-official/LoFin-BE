const { createServer } = require("http");
const { Server } = require("socket.io");
const setupSocketEvents = require("./chatHandler");
const app = require("../app");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.35.111:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocketEvents(io);

module.exports = httpServer;