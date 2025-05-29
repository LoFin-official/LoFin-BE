const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// 🔸 메시지 불러오기: 두 사용자 간 메시지 전체 조회
router.get('/:userId1/:userId2', async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).sort({ timestamp: 1 }); // 시간순 정렬

    res.status(200).json(messages);
  } catch (err) {
    console.error('Failed to get messages:', err);
    res.status(500).json({ message: '서버 오류로 메시지를 불러올 수 없습니다.' });
  }
});

// 🔸 메시지 전송
router.post('/', async (req, res) => {
  const { sender, receiver, content, imageUrl } = req.body;

  if (!sender || !receiver || (!content && !imageUrl)) {
    return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
  }

  try {
    const newMessage = new Message({
      sender,
      receiver,
      content: content || '',
      imageUrl: imageUrl || ''
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ message: '메시지 전송 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
