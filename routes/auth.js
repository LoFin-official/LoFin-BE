const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/mailer");
const mongoose = require("mongoose");
const router = express.Router();
const loginRouter = require("./login"); // login.js 경로 확인

// 임시 메모리 저장에서 MongoDB로 인증 코드 저장
const VerificationCode = mongoose.model(
  "VerificationCode",
  new mongoose.Schema({
    loginId: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: "10m" }, // 인증 코드 10분 후 만료
  })
);

// 1. 이메일 인증 코드 발송
router.post("/send-code", async (req, res) => {
  const { loginId } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(loginId)) {
    return res
      .status(400)
      .json({ success: false, message: "유효한 이메일 주소를 입력해주세요." });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await VerificationCode.findOneAndDelete({ loginId });
    const verificationCode = new VerificationCode({ loginId, code });
    await verificationCode.save();

    const result = await sendVerificationEmail(loginId, code);

    if (!result.success) {
      throw new Error(result.message);
    }

    res.json({ success: true, message: "인증 코드 발송 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "이메일 발송 실패",
      error: err.message,
    });
  }
});

// 2. 인증 코드 확인
router.post("/verify-code", async (req, res) => {
  const { loginId, code } = req.body;

  try {
    const verificationCode = await VerificationCode.findOne({ loginId });

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: "이메일 인증 코드가 만료되었거나 존재하지 않습니다.",
      });
    }

    if (verificationCode.code === code) {
      return res.json({ success: true, message: "인증 성공" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "인증 코드 불일치" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "인증 코드 확인 실패" });
  }
});

// 3. 회원가입
router.post("/register", async (req, res) => {
  const { loginId, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return res.status(400).json({ success: false, message: "비밀번호 불일치" });
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "비밀번호는 최소 8자 이상, 숫자 및 대소문자를 포함해야 합니다.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 먼저 user 저장 (memberId 없이)
    const user = new User({ loginId, password: hashedPassword });
    await user.save();

    // _id 기반으로 memberId 설정 후 다시 저장
    user.memberId = user._id.toString();
    await user.save();

    res.json({ success: true, message: "회원가입 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "회원가입 실패" });
  }
});
router.use("/login", loginRouter);

module.exports = router;
