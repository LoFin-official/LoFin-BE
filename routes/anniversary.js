const express = require("express");
const router = express.Router();
const Anniversary = require("../models/anniversarymodels");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// 🔸 D-day 계산 함수
const getDaysUntilAnniversary = (anniversaryDate) => {
  const currentDate = new Date(); // 현재 날짜
  const targetDate = new Date(anniversaryDate); // 기념일 날짜

  // 날짜 차이를 밀리초로 계산
  const timeDiff = targetDate - currentDate;

  // 날짜 차이를 일수로 변환하고 절대값으로 반환
  const dayDiff = Math.abs(Math.floor(timeDiff / (1000 * 60 * 60 * 24))); // 밀리초를 일수로 변환 후 절대값

  return dayDiff; // D-몇일 남았는지 절대값으로 반환
};

// 🔸 기념일 생성
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

    const days = getDaysUntilAnniversary(date); // 기념일 날짜로부터 남은 일수 계산

    const anniversary = new Anniversary({
      title,
      date,
      ownerId: user._id.toString(),
      coupleId: user.coupleId.toString(),
      anniversaryId: user._id.toString(), // 예시로 사용자의 _id를 anniversaryId로 설정
      days, // days 값을 저장
    });

    await anniversary.save();

    res.status(201).json(anniversary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "기념일 생성 실패" });
  }
});

// 🔸 기념일 전체 조회
router.get("/", auth, async (req, res) => {
  try {
    const memberId = req.memberId;

    const user = await User.findOne({ memberId });

    if (!user || !user.connected || !user.coupleId) {
      return res
        .status(400)
        .json({ message: "커플 연결이 되어있지 않습니다." });
    }

    const anniversaries = await Anniversary.find({ coupleId: user.coupleId });

    // D-몇일 계산
    const anniversariesWithDays = anniversaries.map((anniversary) => {
      const days = getDaysUntilAnniversary(anniversary.date); // 기념일까지 남은 일수 계산
      return {
        ...anniversary.toObject(), // 기존 기념일 객체를 복사
        days, // D-몇일 남았는지 절대값으로 추가
      };
    });

    res.json(anniversariesWithDays); // 기념일과 D-몇일 남았는지 함께 응답
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "기념일 조회 실패" });
  }
});

// 🔸 기념일 수정
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, date } = req.body;
    const { id } = req.params;
    const memberId = req.memberId;

    const user = await User.findOne({ memberId });

    if (!user || !user.connected || !user.coupleId) {
      return res
        .status(400)
        .json({ message: "커플 연결이 되어있지 않습니다." });
    }

    const days = getDaysUntilAnniversary(date);

    const anniversary = await Anniversary.findOneAndUpdate(
      { _id: id, coupleId: user.coupleId },
      { title, date, days },
      { new: true }
    );

    if (!anniversary) {
      return res.status(404).json({ message: "기념일을 찾을 수 없습니다." });
    }

    res.json(anniversary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "기념일 수정 실패" });
  }
});

module.exports = router;
