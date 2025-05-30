const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authenticate = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// 🔸 메시지 불러오기 (JWT 인증 적용)
router.get("/message/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    // DB 쿼리
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error); // 여기에 에러 로그 출력
    res.status(500).json({ error: "서버 내부 오류 발생" });
  }
});

// 🔸 메시지 전송 (JWT 인증 적용)
router.post("/", authenticate, async (req, res) => {
  const { receiver, content, imageUrl } = req.body;
  const sender = req.memberId; // 토큰에서 추출된 사용자 ID 사용

  if (!sender || !receiver || (!content && !imageUrl)) {
    return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
  }

  try {
    const newMessage = new Message({
      sender,
      receiver,
      content: content || "",
      imageUrl: imageUrl || "",
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("메시지 전송 실패:", err);
    res.status(500).json({ message: "메시지 전송 중 오류가 발생했습니다." });
  }
});

module.exports = router;
