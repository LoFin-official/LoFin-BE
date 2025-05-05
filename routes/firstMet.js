const express = require("express");
const router = express.Router();
const {
  setFirstMetDate,
  calculateDaysSinceFirstMet,
  updateFirstMetDate,
} = require("../controllers/userController"); // 올바르게 함수 불러오기
const auth = require("../middleware/authMiddleware"); // 인증 미들웨어

// 처음 만난 날짜 설정 API
router.post("/firstmet", auth, setFirstMetDate);

router.put("/update", auth, updateFirstMetDate);

// D-몇일 계산 API
router.get("/days-since-first-met", auth, calculateDaysSinceFirstMet);

module.exports = router;
