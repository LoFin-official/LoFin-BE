const jwt = require("jsonwebtoken");
const User = require("../models/User"); // User 모델 import

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "토큰이 없습니다. 로그인 후 다시 시도하세요.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const memberId = decoded.memberId || decoded.id;

    if (!decoded.memberId && !decoded.id) {
      return res.status(400).json({
        success: false,
        message: "토큰에 사용자 정보가 포함되어 있지 않습니다.",
      });
    }

    const user = await User.findOne({ memberId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    req.memberId = user.memberId;
    req.coupleId = user.coupleId; // 추가된 필드

    next();
  } catch (err) {
    console.error("토큰 검증 오류:", err.message); // 오류 메시지 로깅
    return res.status(401).json({
      success: false,
      message: "유효하지 않은 토큰입니다.",
      error: err.message, // 오류 메시지 추가
    });
  }
};

module.exports = authenticate;
