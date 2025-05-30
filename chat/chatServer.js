const { createServer } = require("http");
const { Server } = require("socket.io");
const setupSocketEvents = require("./chatHandler");
const app = require("../app");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://172.30.1.91:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocketEvents(io);

module.exports = httpServer;
