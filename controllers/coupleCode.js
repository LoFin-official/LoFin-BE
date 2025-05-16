const crypto = require("crypto");
const User = require("../models/User"); // User 모델 가져오기

// 랜덤 코드 생성 함수 (10자리)
const generateRandomCode = () => {
  return crypto.randomBytes(5).toString("hex").toUpperCase(); // 10자리 대문자 영숫자 코드
};

// 커플 연결 페이지 접근 시, coupleCode 생성
const generateCoupleCode = async (req, res) => {
  try {
    const memberId = req.memberId; // 인증된 사용자 memberId

    if (!memberId) {
      return res.status(400).json({ message: "사용자 정보가 없습니다." });
    }

    // 사용자가 이미 coupleCode를 가지고 있는지 확인
    const existingUser = await User.findOne({ memberId });

    if (!existingUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    if (existingUser.coupleCode) {
      return res.status(400).json({
        message: "이미 커플 코드가 생성되었습니다.",
        coupleCode: existingUser.coupleCode,
      });
    }

    // 새 coupleCode 생성
    const coupleCode = generateRandomCode();

    // 사용자 프로필에 coupleCode 업데이트
    existingUser.coupleCode = coupleCode;
    await existingUser.save();

    res.status(200).json({
      message: "커플 코드가 생성되었습니다.",
      coupleCode, // 생성된 코드 반환
    });
  } catch (err) {
    console.error("커플 코드 생성 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = { generateCoupleCode };
