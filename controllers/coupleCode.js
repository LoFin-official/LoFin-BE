const crypto = require("crypto");
const User = require("../models/User");

// 랜덤 10자리 코드 생성 (영문 대문자 + 숫자 혼합)
const generateRandomCode = () => {
  return crypto.randomBytes(5).toString("hex").toUpperCase();
};

// 중복되지 않는 커플 코드 생성 함수
const createUniqueCoupleCode = async () => {
  let code;
  let isUnique = false;
  let attempt = 0;

  while (!isUnique && attempt < 5) {
    code = generateRandomCode();
    const existing = await User.findOne({ coupleCode: code });

    if (!existing) {
      isUnique = true;
    }
    attempt++;
  }

  if (!isUnique) {
    throw new Error("고유한 커플 코드를 생성할 수 없습니다.");
  }

  return code;
};

// 커플 코드 생성 API
const generateCoupleCode = async (req, res) => {
  try {
    const memberId = req.memberId;

    if (!memberId) {
      return res.status(400).json({ message: "사용자 정보가 없습니다." });
    }

    const user = await User.findOne({ memberId });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 이미 커플 코드가 있는 경우 그대로 반환
    if (user.coupleCode) {
      return res.status(200).json({
        message: "이미 커플 코드가 존재합니다.",
        coupleCode: user.coupleCode,
      });
    }

    // 고유한 커플 코드 생성
    const newCoupleCode = await createUniqueCoupleCode();
    user.coupleCode = newCoupleCode;
    await user.save();

    return res.status(200).json({
      message: "커플 코드가 성공적으로 생성되었습니다.",
      coupleCode: newCoupleCode,
    });
  } catch (err) {
    console.error("커플 코드 생성 오류:", err);
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = { generateCoupleCode };
