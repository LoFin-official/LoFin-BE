const express = require("express");
const router = express.Router();
const {
  sendVerificationCode,
  verifyCode,
  resetPasswordRequest,
  resetPassword,
} = require("../controllers/authController");

// 이메일 인증 코드 발송
router.post("/send-code", sendVerificationCode);

// 이메일 인증 코드 검증
router.post("/verify-code", verifyCode);

// 비밀번호 재설정 요청
router.post("/reset-password-request", resetPasswordRequest);

// 비밀번호 변경 처리
router.post("/reset-password", resetPassword);

module.exports = router;
