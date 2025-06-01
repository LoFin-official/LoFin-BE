const express = require("express");
const router = express.Router();
const { generateCoupleCode } = require("../controllers/coupleCode"); // 커플 코드 생성
const { connectCouple } = require("../controllers/coupleController"); // 추가
const auth = require("../middleware/authMiddleware");
const User = require("../models/User"); // User 모델 불러오기

// 커플 코드 생성 API
router.post("/couple/code", auth, generateCoupleCode);

// 커플 연결 API
router.post("/connect", auth, connectCouple); // connectCouple을 컨트롤러에서 사용
router.get("/me", auth, async (req, res) => {
  try {
    // authenticate 미들웨어에서 req.memberId에 사용자 memberId가 있음
    const memberId = req.memberId;

    // memberId로 사용자 조회
    const user = await User.findOne({ memberId }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json(user);
  } catch (err) {
    console.error("사용자 정보 조회 중 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});
module.exports = router;
