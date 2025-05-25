const Message = require("../models/Message");

const users = new Map(); // userId -> socket

function setupSocketEvents(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      users.set(userId, socket);
      console.log(`${userId} 연결됨`);
    }

    socket.on("privateMessage", async ({ to, from, content }) => {
      const message = new Message({ sender: from, receiver: to, content });
      await message.save();

      const receiverSocket = users.get(to);
      if (receiverSocket) {
        receiverSocket.emit("privateMessage", {
          from,
          content,
          timestamp: new Date(),
        });
      }
    });

    socket.on("disconnect", () => {
      users.forEach((value, key) => {
        if (value === socket) {
          users.delete(key);
          console.log(`${key} 연결 해제됨`);
        }
      });
    });
  });
}

module.exports = setupSocketEvents;
