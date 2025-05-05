const express = require("express");
const router = express.Router();
const {
  resetPasswordRequest,
  resetPassword,
} = require("../controllers/authController");

// 비밀번호 재설정 요청
router.post("/reset-password-request", resetPasswordRequest); // 이메일 입력 후 재설정 페이지로 이동
router.post("/reset-password", resetPassword); // 비밀번호 변경 처리

module.exports = router;
