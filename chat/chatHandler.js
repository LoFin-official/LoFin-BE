const jwt = require('jsonwebtoken');

const users = new Map(); // memberId -> socket

function setupSocketEvents(io) {
  io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;
    const memberId = getMemberIdFromToken(token);

    if (!memberId) {
      console.log('❌ 사용자 인증 실패');
      socket.disconnect();
      return;
    }

    console.log(`✅ ${memberId} 소켓 연결됨 (Socket ID: ${socket.id})`);
    users.set(memberId, socket);

    socket.on('disconnect', () => {
      console.log(`⚠️ ${memberId} 연결 해제`);
      users.delete(memberId);
    });
  });
}

function getMemberIdFromToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.memberId;
  } catch (err) {
    console.error('❌ 토큰 디코딩 실패:', err.message);
    return null;
  }
}

module.exports = {
  setupSocketEvents,
  users,
};
