const express = require("express");
const router = express.Router();
const {
  setFirstMetDate,
  calculateDaysSinceFirstMet,
  updateFirstMetDate,
  getFirstMetDate, // 추가
} = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

router.post("/firstmet", auth, setFirstMetDate);
router.put("/update", auth, updateFirstMetDate);
router.get("/days-since-first-met", auth, calculateDaysSinceFirstMet);

// 새로 추가하는 경로
router.get("/firstmet", auth, getFirstMetDate);
router.get("/firstMet/status", auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const user = await User.findOne({ memberId });

    if (!user) return res.status(404).json({ message: "사용자 없음" });
    if (!user.coupleCode)
      return res.status(400).json({ message: "커플 코드 없음" });

    const coupleUsers = await User.find({ coupleCode: user.coupleCode });

    const bothCompleted = coupleUsers.every((u) => !!u.firstMetDate);

    res.json({ bothCompleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
