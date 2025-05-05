const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

module.exports = { resetPassword, resetPasswordRequest };
