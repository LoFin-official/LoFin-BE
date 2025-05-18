const User = require("../models/User");
const mongoose = require("mongoose");

const connectCouple = async (req, res) => {
  try {
    const mymemberId = req.memberId;
    const { coupleCode } = req.body;

    if (!coupleCode) {
      return res.status(400).json({ message: "코드를 입력해주세요." });
    }

    // 대문자로 변환하여 일관성 유지
    const normalizedCoupleCode = coupleCode.toUpperCase();

    // 내 정보 조회
    const me = await User.findById(mymemberId);
    if (!me) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 자신과 동일한 코드를 입력하는 것을 방지
    if (me.coupleCode === normalizedCoupleCode) {
      return res
        .status(400)
        .json({ message: "본인의 코드는 사용할 수 없습니다." });
    }

    // 내가 이미 커플 연결되어 있는지 확인
    if (me.partnerId || me.connected) {
      return res.status(400).json({ message: "이미 연결된 사용자입니다." });
    }

    // 파트너 조회 - 정확한 코드와 아직 연결되지 않은 사용자
    const partner = await User.findOne({
      coupleCode: normalizedCoupleCode,
      $or: [{ partnerId: { $exists: false } }, { partnerId: null }],
      $or: [{ connected: { $exists: false } }, { connected: false }],
    });

    if (!partner) {
      return res.status(404).json({
        message:
          "입력한 커플 코드를 가진 사용자가 없거나 이미 연결된 사용자입니다.",
      });
    }

    // ObjectId를 사용하여 커플 ID 생성
    const coupleId = new mongoose.Types.ObjectId();

    // 커플 연결 처리
    me.partnerId = partner._id;
    partner.partnerId = me._id;

    me.connected = true;
    partner.connected = true;

    // 커플 ID 추가
    me.coupleId = coupleId;
    partner.coupleId = coupleId;

    // 저장
    await me.save();
    await partner.save();

    // 연결 성공 메시지와 파트너 정보 반환
    res.status(200).json({
      message: "커플이 성공적으로 연결되었습니다.",
      coupleId,
      partner: {
        id: partner._id,
        nickname: partner.nickname,
        email: partner.email,
      },
    });
  } catch (err) {
    console.error("커플 연결 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = { connectCouple };
