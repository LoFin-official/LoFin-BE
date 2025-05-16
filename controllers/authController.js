const User = require("../models/User");
const bcrypt = require("bcryptjs");
// controllers/authController.js

const nodemailer = require("nodemailer"); // 이메일 발송용 (설치 필요: npm i nodemailer)

// 간단한 메모리 저장소 (운영에선 DB나 Redis 추천)
const verificationCodes = {};

// 이메일 인증 코드 발송
const sendVerificationCode = async (req, res) => {
  const { loginId } = req.body;

  try {
    // 인증코드 6자리 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 코드 저장 (유효기간 5분 설정 예시)
    verificationCodes[loginId] = { code, expires: Date.now() + 5 * 60 * 1000 };

    // 이메일 발송 (간단 예시: Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your_email@gmail.com",
        pass: "your_app_password", // 앱 비밀번호 권장
      },
    });

    const mailOptions = {
      from: "your_email@gmail.com",
      to: loginId,
      subject: "비밀번호 재설정 인증 코드",
      text: `인증 코드는 ${code} 입니다. 5분 내에 입력해주세요.`,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "인증 코드가 전송되었습니다." });
  } catch (err) {
    console.error("인증 코드 발송 실패:", err);
    return res
      .status(500)
      .json({ success: false, message: "인증 코드 발송 실패" });
  }
};

// 인증 코드 검증
const verifyCode = (req, res) => {
  const { loginId, code } = req.body;
  const record = verificationCodes[loginId];

  if (!record) {
    return res
      .status(400)
      .json({ success: false, message: "인증 요청이 없습니다." });
  }

  if (Date.now() > record.expires) {
    delete verificationCodes[loginId];
    return res
      .status(400)
      .json({ success: false, message: "인증 코드가 만료되었습니다." });
  }

  if (record.code !== code) {
    return res
      .status(400)
      .json({ success: false, message: "인증 코드가 일치하지 않습니다." });
  }

  // 인증 성공 시 저장된 코드 삭제
  delete verificationCodes[loginId];
  return res
    .status(200)
    .json({ success: true, message: "인증이 완료되었습니다." });
};
const resetPasswordRequest = async (req, res) => {
  const { loginId } = req.body;

  try {
    // 이메일로 사용자 찾기
    const user = await User.findOne({ loginId });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호 재설정 페이지로 리디렉션 처리 (프론트엔드에서 이 페이지로 이동)
    res.status(200).json({ message: "비밀번호 재설정 페이지로 이동합니다." });
  } catch (err) {
    console.error("비밀번호 재설정 요청 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { loginId, newPassword, confirmPassword } = req.body;

  try {
    // 비밀번호 확인
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 이메일로 사용자 찾기
    const user = await User.findOne({ loginId });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 새 비밀번호로 업데이트
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res
      .status(200)
      .json({ message: "비밀번호가 성공적으로 재설정되었습니다." });
  } catch (err) {
    console.error("비밀번호 재설정 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = {
  sendVerificationCode,
  verifyCode,
  resetPasswordRequest,
  resetPassword,
};
