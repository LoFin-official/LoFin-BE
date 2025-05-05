const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "토큰이 없습니다. 로그인 후 다시 시도하세요.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // 토큰 검증

    // decoded에 memberId 또는 id가 있어야 함
    if (!decoded.memberId && !decoded.id) {
      return res.status(400).json({
        success: false,
        message: "토큰에 사용자 정보가 포함되어 있지 않습니다.",
      });
    }

    req.memberId = decoded.memberId || decoded.id;
    next();
  } catch (err) {
    console.error("토큰 검증 오류:", err.message);
    return res.status(401).json({
      success: false,
      message: "유효하지 않은 토큰입니다.",
      error: err.message,
    });
  }
};

module.exports = authenticate;
