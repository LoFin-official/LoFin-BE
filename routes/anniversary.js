const express = require("express");
const router = express.Router();
const Anniversary = require("../models/anniversarymodels");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// ✅ D-day 계산 함수 (과거는 음수, 오늘은 0, 미래는 양수)
const getDaysUntilAnniversary = (anniversaryDate) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // 시간 제거

  const targetDate = new Date(anniversaryDate);
  targetDate.setHours(0, 0, 0, 0); // 시간 제거

  const diff = Math.floor((targetDate - currentDate) / (1000 * 60 * 60 * 24));
  return diff;
};

// ✅ 기념일 생성
router.post("/", auth, async (req, res) => {
  try {
    const { title, date } = req.body;
    const memberId = req.memberId;

    const user = await User.findOne({ memberId });

    if (!user || !user.connected || !user.coupleId) {
      return res
        .status(400)
        .json({ message: "커플 연결이 되어있지 않습니다." });
    }

    const days = getDaysUntilAnniversary(date);

    let anniversary = new Anniversary({
      title,
      date,
      ownerId: user._id.toString(),
      coupleId: user.coupleId.toString(),
      days,
    });

    anniversary = await anniversary.save();

    anniversary.anniversaryId = anniversary._id.toString();
    await anniversary.save();

    res.status(201).json(anniversary);
  } catch (err) {
    console.error("❌ 서버 오류:", err);
    res.status(500).json({ message: "기념일 생성 실패" });
  }
});

// ✅ 기념일 전체 조회
router.get("/", auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const user = await User.findOne({ memberId });

    if (!user || !user.connected || !user.coupleId) {
      return res
        .status(400)
        .json({ message: "커플 연결이 되어있지 않습니다." });
    }

    const coupleId = user.coupleId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ⛔ 오늘 이전 기념일 삭제
    await Anniversary.deleteMany({
      coupleId,
      date: { $lt: today },
    });

    const anniversaries = await Anniversary.find({ coupleId });

    // ✅ D-day 최신화 후 반환
    const updated = await Promise.all(
      anniversaries.map(async (anniversary) => {
        const days = getDaysUntilAnniversary(anniversary.date);

        if (anniversary.days !== days) {
          anniversary.days = days;
          await anniversary.save(); // DB 업데이트
        }

        return anniversary.toObject();
      })
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "기념일 조회 실패" });
  }
});

// ✅ 기념일 수정
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title, date } = req.body;
  const coupleId = req.coupleId;

  try {
    const days = getDaysUntilAnniversary(date);

    const updatedAnniversary = await Anniversary.findOneAndUpdate(
      { _id: id, coupleId },
      { title, date, days },
      { new: true }
    );

    if (!updatedAnniversary) {
      return res.status(404).json({ message: "기념일을 찾을 수 없습니다." });
    }

    res.status(200).json(updatedAnniversary);
  } catch (err) {
    console.error("기념일 수정 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 기념일 단일 조회
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const coupleId = req.coupleId;

  try {
    const anniversary = await Anniversary.findOne({ _id: id, coupleId });

    if (!anniversary) {
      return res.status(404).json({ message: "기념일을 찾을 수 없습니다." });
    }

    res.status(200).json(anniversary);
  } catch (err) {
    console.error("기념일 조회 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 기념일 삭제
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const coupleId = req.coupleId;

  try {
    const deleted = await Anniversary.findOneAndDelete({ _id: id, coupleId });

    if (!deleted) {
      return res.status(404).json({ message: "기념일을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "기념일이 삭제되었습니다." });
  } catch (err) {
    console.error("기념일 삭제 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
