const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// 로그인 처리
router.post("/", async (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return res
      .status(400)
      .json({ success: false, message: "이메일과 비밀번호를 입력해주세요." });
  }

  try {
    const user = await User.findOne({ loginId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "이메일 또는 비밀번호가 틀렸습니다.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "이메일 또는 비밀번호가 틀렸습니다.",
      });
    }

    // ✅ memberId로 변경
    const token = jwt.sign({ memberId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      message: "로그인 성공",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
