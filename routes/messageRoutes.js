const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authenticate = require("../middleware/authMiddleware");

// ✅ 메시지 전송 API - 인증 필요
router.post("/", authenticate, async (req, res) => {
  const { receiver, content, imageUrl } = req.body;

  // 기존 authMiddleware에서 제공하는 memberId 사용
  const senderId = req.memberId;

  console.log("받은 요청:", req.body);
  console.log("인증된 사용자 ID:", req.memberId);


  // 유효성 검사 (보내는 사람, 받는 사람, 내용/이미지 필수)
  if (!senderId || !receiver || !content) {
    return res.status(400).json({
      success: false,
      message: "보낼 사용자 정보 또는 메시지 내용이 없습니다.",
    });
  }

  try {
    const newMessage = new Message({
      sender: senderId,
      receiver,
      content: content || "",
      imageUrl: imageUrl || "",
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "메시지 전송 완료",
      data: newMessage,
    });
  } catch (err) {
    console.error("메시지 저장 오류:", err);
    res.status(500).json({
      success: false,
      message: "메시지 전송 실패",
      error: err.message,
    });
  }
});

// ✅ 메시지 불러오기 API - 인증 없이도 가능
router.get("/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "메시지 불러오기 성공",
      data: messages,
    });
  } catch (err) {
    console.error("메시지 불러오기 오류:", err);
    res.status(500).json({
      success: false,
      message: "메시지 불러오기 실패",
      error: err.message,
    });
  }
});

module.exports = router;
