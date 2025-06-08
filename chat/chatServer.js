require('dotenv').config();
const { createServer } = require('http');
const { Server } = require('socket.io');
const { setupSocketEvents } = require('./chatHandler'); // ✅ 구조 분해 import
const app = require('../app');

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', process.env.PRIVATE_IP],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketEvents(io); // ✅ 소켓 이벤트 연결

module.exports = httpServer;
