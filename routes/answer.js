const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const Answer = require("../models/answer");

// ✅ POST: 질문에 대한 답변 저장
router.post("/", authenticate, async (req, res) => {
  try {
    const { questionId, content } = req.body;
    const { memberId } = req;

    if (!questionId || !content) {
      return res
        .status(400)
        .json({ error: "questionId와 content는 필수입니다." });
    }

    const newAnswer = new Answer({
      questionId,
      content,
      memberId,
    });

    await newAnswer.save();

    res.status(201).json({
      message: "답변이 저장되었습니다.",
      answer: newAnswer,
    });
  } catch (err) {
    res.status(500).json({
      error: "답변 저장 중 오류 발생",
      details: err.message,
    });
  }
});

// ✅ GET: 특정 질문에 대한 내 답변 조회
router.get("/:questionId", authenticate, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { memberId } = req;

    const answer = await Answer.findOne({ questionId, memberId }).populate(
      "questionId",
      "title"
    );

    if (!answer) {
      return res.status(404).json({ message: "답변이 존재하지 않습니다." });
    }

    res.status(200).json({
      questionTitle: answer.questionId.title,
      content: answer.content,
    });
  } catch (err) {
    res.status(500).json({
      error: "답변 조회 중 오류 발생",
      details: err.message,
    });
  }
});

// ✅ PUT: 특정 질문에 대한 내 답변 수정
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const { memberId } = req;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "답변 내용이 비어 있습니다." });
    }

    const answer = await Answer.findOneAndUpdate(
      { questionId: id, memberId },
      { content },
      { new: true }
    );

    if (!answer) {
      return res
        .status(404)
        .json({ message: "수정할 답변이 존재하지 않습니다." });
    }

    res.status(200).json({
      message: "답변이 수정되었습니다.",
      answer,
    });
  } catch (err) {
    res.status(500).json({
      error: "답변 수정 중 오류 발생",
      details: err.message,
    });
  }
});

module.exports = router;
