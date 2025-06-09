const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authenticate = require('../middleware/authMiddleware');
const { users } = require('../chat/chatHandler'); // 소켓 연결된 사용자 정보

router.post('/', authenticate, async (req, res) => {
  const { receiver, content, imageUrl } = req.body;
  const senderId = req.memberId;

  if (!senderId || !receiver || (!content && !imageUrl)) {
    return res.status(400).json({ success: false, message: '필수 값이 없습니다.' });
  }

  try {
    const newMessage = new Message({ sender: senderId, receiver, content, imageUrl });
    await newMessage.save();

    const receiverSocket = users.get(receiver);
    if (receiverSocket) {
      receiverSocket.emit('privateMessage', newMessage.toObject());
      console.log(`📤 ${receiver}에게 실시간 메시지 전송`);
    } else {
      console.log(`⚠️ ${receiver}는 오프라인 상태`);
    }

    // sender에게도 실시간 메시지 전송
    const senderSocket = users.get(senderId);
    if (senderSocket) {
      senderSocket.emit('privateMessage', newMessage.toObject());
      console.log(`📤 ${senderId}에게 실시간 메시지 전송 (본인)`);
    } else {
      console.log(`⚠️ ${senderId}는 오프라인 상태`);
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: '전송 실패', error: err.message });
  }
});

router.get('/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: '불러오기 실패', error: err.message });
  }
});

module.exports = router;
