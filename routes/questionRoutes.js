const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const authenticate = require("../middleware/authMiddleware"); // 인증 미들웨어 추가
const User = require("../models/User"); // 사용자 모델 추가
const Answer = require("../models/answer"); // 답변 모델 추가

// ✅ POST: 사용자 질문 저장 (JWT 인증 필요)
router.post("/", authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const { memberId, coupleId } = req;

    if (!content) {
      return res.status(400).json({ error: "content 필드는 필수입니다." });
    }

    const newQuestion = new Question({
      title: content,
      content,
      memberId,
      coupleId, // ✅ 커플 ID도 저장
    });

    await newQuestion.save();

    res.status(201).json({
      message: "질문이 저장되었습니다.",
      question: newQuestion,
    });
  } catch (err) {
    res.status(500).json({
      error: "질문 저장 중 오류 발생",
      details: err.message,
    });
  }
});
// ✅ GET: 로그인된 커플의 질문 목록 가져오기 (JWT 인증 필요)
router.get("/", authenticate, async (req, res) => {
  try {
    const { coupleId } = req;

    if (!coupleId) {
      return res.status(400).json({ error: "커플 ID가 없습니다." });
    }

    // coupleId로 질문들 조회, 최신순 정렬
    const questions = await Question.find({ coupleId }).sort({ createdAt: -1 });

    res.json({ questions });
  } catch (err) {
    res.status(500).json({
      error: "질문 목록을 불러오는 중 오류 발생",
      details: err.message,
    });
  }
});

// ✅ GET: 시스템 질문 중 하나 랜덤으로 가져오기
router.get("/random", async (req, res) => {
  try {
    const count = await Question.countDocuments({ memberId: "system" });

    if (count === 0) {
      return res.status(404).json({ message: "시스템 질문이 없습니다." });
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne({ memberId: "system" }).skip(
      random
    );

    if (!question) {
      return res.status(404).json({ message: "질문을 찾을 수 없습니다." });
    }

    res.json(question);
  } catch (err) {
    res.status(500).json({
      error: "랜덤 질문 가져오는 중 오류 발생",
      details: err.message,
    });
  }
});
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req;

    // Find question by ID
    const question = await Question.findById(id);
    if (!question)
      return res.status(404).json({ message: "질문을 찾을 수 없습니다." });

    // Find current user and their partner
    const myUser = await User.findOne({ memberId });
    if (!myUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const partnerUser = await User.findById(myUser.partnerId);
    if (!partnerUser) {
      return res.status(404).json({ message: "파트너를 찾을 수 없습니다." });
    }

    // Find answers for both users
    const myAnswer = await Answer.findOne({
      questionId: id,
      memberId: myUser._id,
    });

    const partnerAnswer = await Answer.findOne({
      questionId: id,
      memberId: partnerUser._id,
    });

    res.json({
      question,
      myNickname: myUser.nickname,
      partnerNickname: partnerUser.nickname,
      myProfileImageUrl: myUser.profilePicture,
      partnerProfileImageUrl: partnerUser.profilePicture,
      myAnswer: myAnswer ? myAnswer.content : null,
      partnerAnswer: partnerAnswer ? partnerAnswer.content : null,
    });
  } catch (error) {
    console.error("Error fetching question details:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
});

module.exports = router;
