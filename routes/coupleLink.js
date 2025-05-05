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

module.exports = router;
