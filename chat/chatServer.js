require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");
const setupSocketEvents = require("./chatHandler");
const app = require("../app");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", process.env.PRIVATE_IP], //.env에 본인 IP입력
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocketEvents(io);

module.exports = httpServer;
