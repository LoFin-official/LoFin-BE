// controllers/userController.js
const User = require("../models/User");

exports.register = async (req, res) => {
  const { email, password } = req.body;
  // 유효성 검사, 중복 체크 등...
};
// controllers/userController.js

// controllers/userController.js

// 처음 만난 날짜 설정
const setFirstMetDate = async (req, res) => {
  try {
    const { firstMetDate } = req.body;
    const memberId = req.memberId; // 인증된 사용자 ID 가져오기

    if (!firstMetDate) {
      return res.status(400).json({ message: "날짜를 입력해주세요." });
    }

    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 현재 사용자의 첫 만난 날짜 설정
    user.firstMetDate = new Date(firstMetDate);
    await user.save();

    // 상대방이 존재하면 상대방의 firstMetDate도 설정
    if (user.partnerId) {
      const partner = await User.findById(user.partnerId);
      if (partner) {
        partner.firstMetDate = new Date(firstMetDate);
        await partner.save();
      }
    }

    res.status(200).json({ message: "처음 만난 날짜가 설정되었습니다." });
  } catch (err) {
    console.error("처음 만난 날짜 설정 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

const updateFirstMetDate = async (req, res) => {
  try {
    const { firstMetDate } = req.body;
    const memberId = req.memberId; // 인증된 사용자 ID

    // 날짜가 없으면 에러 처리
    if (!firstMetDate) {
      return res.status(400).json({ message: "날짜를 입력해주세요." });
    }

    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 현재 날짜와 동일한 날짜로 수정하려는 경우 처리
    if (user.firstMetDate.toString() === new Date(firstMetDate).toString()) {
      return res
        .status(400)
        .json({ message: "현재 날짜와 동일한 날짜로 수정할 수 없습니다." });
    }

    // 처음 만난 날짜 수정
    user.firstMetDate = new Date(firstMetDate);
    await user.save();

    // 상대방이 존재하면 상대방의 firstMetDate도 수정
    if (user.partnerId) {
      const partner = await User.findById(user.partnerId);
      if (partner) {
        partner.firstMetDate = new Date(firstMetDate);
        await partner.save();
      }
    }

    res.status(200).json({ message: "처음 만난 날짜가 수정되었습니다." });
  } catch (err) {
    console.error("처음 만난 날짜 수정 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// D-몇일 계산
const calculateDaysSinceFirstMet = async (req, res) => {
  try {
    const memberId = req.memberId;

    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    if (!user.firstMetDate) {
      return res
        .status(400)
        .json({ message: "처음 만난 날짜가 설정되지 않았습니다." });
    }

    // 날짜만 비교할 수 있도록 시각 제거
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstMetDate = new Date(user.firstMetDate);
    firstMetDate.setHours(0, 0, 0, 0);

    const diffTime = today - firstMetDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 올림 ❌ → 내림 ✔

    res.status(200).json({ message: `D+${diffDays}일` });
  } catch (err) {
    console.error("D-몇일 계산 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 처음 만난 날짜 조회
const getFirstMetDate = async (req, res) => {
  try {
    const memberId = req.memberId;

    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    if (!user.firstMetDate) {
      return res
        .status(404)
        .json({ message: "처음 만난 날짜가 설정되지 않았습니다." });
    }

    res
      .status(200)
      .json({ firstMetDate: user.firstMetDate.toISOString().split("T")[0] }); // YYYY-MM-DD 형태로 응답
  } catch (err) {
    console.error("처음 만난 날짜 조회 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = {
  setFirstMetDate,
  calculateDaysSinceFirstMet,
  updateFirstMetDate,
  getFirstMetDate,
};
