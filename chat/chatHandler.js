const Message = require("../models/Message");

const users = new Map(); // memberId -> socket

function setupSocketEvents(io) {
  io.on("connection", (socket) => {
    const memberId = socket.handshake.query.memberId;
    const coupleId = socket.handshake.query.coupleId; // 클라이언트가 보내야 함

    if (memberId) {
      users.set(memberId, socket);
      console.log(`${memberId} 연결됨`);
    }

    // 커플 방에 자동 입장
    if (coupleId) {
      socket.join(coupleId);
      console.log(`${memberId}님이 커플 방 ${coupleId}에 자동 입장`);
    }

    // privateMessage 이벤트 수신: coupleId 방으로 메시지 브로드캐스트
    socket.on("privateMessage", async ({ to, from, content, imageUrl, coupleId }) => {
      // 메시지 저장
      const message = new Message({
        sender: from,
        receiver: to,
        content,
        imageUrl,
      });
      await message.save();

      // coupleId 방에 메시지 전송 (본인과 파트너 모두 수신)
      io.to(coupleId).emit("privateMessage", {
        from,
        content,
        imageUrl,
        timestamp: new Date(),
      });
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
