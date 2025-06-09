const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, async (req, res) => {
  try {
    const memberId = req.memberId;

    // 내 프로필 조회
    const myProfile = await User.findOne({ memberId });

    if (!myProfile) {
      return res.status(404).json({ message: '내 프로필을 찾을 수 없습니다.' });
    }

    // 커플 연결 여부 체크
    if (!myProfile.connected || !myProfile.coupleId) {
      return res.status(400).json({ message: '커플 연결이 되어 있지 않습니다.' });
    }

    // 상대방 프로필 조회 (partnerId로 직접 참조 가능)
    const partnerProfile = await User.findById(myProfile.partnerId);

    if (!partnerProfile) {
      return res.status(404).json({ message: '상대방 프로필을 찾을 수 없습니다.' });
    }

    res.json({
      myProfile: {
        nickname: myProfile.nickname,
        birth: myProfile.birth ? myProfile.birth.toISOString().split('T')[0] : null,
        profilePicture: myProfile.profilePicture || null,
      },
      partnerProfile: {
        _id: partnerProfile._id,
        nickname: partnerProfile.nickname,
        birth: partnerProfile.birth ? partnerProfile.birth.toISOString().split('T')[0] : null,
        profilePicture: partnerProfile.profilePicture || null,
      },
      coupleInfo: {
        firstMeetingDate: myProfile.firstMetDate ? myProfile.firstMetDate.toISOString().split('T')[0] : null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
