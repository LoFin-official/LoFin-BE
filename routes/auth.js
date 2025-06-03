const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/mailer");
const mongoose = require("mongoose");
const router = express.Router();
const loginRouter = require("./login"); // login.js 경로 확인
const jwt = require("jsonwebtoken"); // 추가
const auth = require("../middleware/authMiddleware"); // 인증 미들웨어

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
    const existingUser = await User.findOne({ loginId });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "이미 존재하는 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // user 생성
    const user = new User({ loginId, password: hashedPassword });
    await user.save();

    // _id 기반 memberId 설정
    user.memberId = user._id.toString();
    await user.save();

    // ✅ JWT 토큰 발급
    const token = jwt.sign(
      { memberId: user.memberId, loginId: user.loginId },
      process.env.JWT_SECRET, // 환경 변수에서 비밀키 사용
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "회원가입 및 로그인 성공",
      token, // ⬅ 프론트에 전달
      memberId: user.memberId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "회원가입 실패" });
  }
});
router.use("/login", loginRouter);
router.delete("/delete", auth, async (req, res) => {
  try {
    const memberId = req.memberId;

    // 1. 본인 정보 조회
    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 2. 상대방 id가 존재하면 상대방 필드 초기화
    if (user.partnerId) {
      await User.findByIdAndUpdate(user.partnerId, {
        connected: false,
        partnerId: null,
        firstMetDate: null,
        coupleId: null,
      });
    }

    // 3. 본인 계정 삭제
    await User.findByIdAndDelete(memberId);

    res.status(200).json({ message: "회원 탈퇴 및 상대방 필드 초기화 완료" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});
router.get("/:memberId", auth, async (req, res) => {
  try {
    const requestedMemberId = req.params.memberId; // 경로에서 멤버아이디
    const tokenMemberId = req.memberId; // 인증미들웨어에서 넣어준 멤버아이디

    if (requestedMemberId !== tokenMemberId) {
      return res.status(403).json({
        success: false,
        message: "접근 권한이 없습니다.",
      });
    }

    const user = await User.findOne(
      { memberId: tokenMemberId },
      "connected partnerId firstMetDate coupleId memberId"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: error.message,
    });
  }
});
router.delete("/couple", auth, async (req, res) => {
  const memberId = req.memberId; // 인증 미들웨어에서 추출

  try {
    const user = await User.findOne({ memberId });
    if (!user || !user.connected || !user.partnerId) {
      return res.status(400).json({ message: "이미 연결이 끊겼습니다." });
    }

    // 상대방도 함께 업데이트
    const partner = await User.findById(user.partnerId);
    if (partner) {
      partner.connected = false;
      partner.partnerId = null;
      partner.coupleId = null;
      partner.firstMetDate = null;
      await partner.save();
    }

    // 내 정보 초기화
    user.connected = false;
    user.partnerId = null;
    user.coupleId = null;
    user.firstMetDate = null;
    await user.save();

    res.status(200).json({ message: "연결이 성공적으로 끊어졌습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류입니다." });
  }
});

module.exports = router;
