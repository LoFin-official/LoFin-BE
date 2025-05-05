const User = require("../models/User");
const mongoose = require("mongoose"); // mongoose import 추가

const connectCouple = async (req, res) => {
  try {
    const mymemberId = req.memberId; // 인증 미들웨어에서 설정한 사용자 ID
    const { coupleCode } = req.body;

    if (!coupleCode) {
      return res.status(400).json({ message: "코드를 입력해주세요." });
    }

    const me = await User.findById(mymemberId);
    if (!me) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 자신과 동일한 코드를 입력하는 것을 방지
    if (me.coupleCode === coupleCode) {
      return res
        .status(400)
        .json({ message: "본인의 코드는 사용할 수 없습니다." });
    }

    const partner = await User.findOne({ coupleCode: coupleCode });

    if (!partner) {
      return res
        .status(404)
        .json({ message: "입력한 커플 코드를 가진 사용자가 없습니다." });
    }

    // 이미 서로 연결되어 있다면
    if (me.partnerId || partner.partnerId) {
      return res.status(400).json({ message: "이미 연결된 사용자입니다." });
    }

    // ObjectId를 사용하여 커플 ID 생성
    const coupleId = new mongoose.Types.ObjectId(); // MongoDB의 ObjectId 사용

    // 커플 연결 처리
    me.partnerId = partner._id; // me의 partnerId를 partner의 _id로 설정
    partner.partnerId = me._id; // partner의 partnerId를 me의 _id로 설정

    me.connected = true; // me의 connected 상태를 true로 설정
    partner.connected = true; // partner의 connected 상태를 true로 설정

    // 커플 ID 추가
    me.coupleId = coupleId; // me의 coupleId 설정
    partner.coupleId = coupleId; // partner의 coupleId 설정

    // 저장
    await me.save();
    await partner.save();

    res.status(200).json({
      message: "커플이 성공적으로 연결되었습니다.",
      coupleId, // 반환할 때 coupleId도 같이 보내기
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
