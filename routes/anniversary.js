const express = require("express");
const router = express.Router();
const Anniversary = require("../models/anniversarymodels");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const mongoose = require("mongoose"); // 최상단에 require 위치 변경

// 🔸 D-day 계산 함수
const getDaysUntilAnniversary = (anniversaryDate) => {
  const currentDate = new Date(); // 현재 날짜
  const targetDate = new Date(anniversaryDate); // 기념일 날짜

  // 날짜 차이를 밀리초로 계산
  const timeDiff = targetDate - currentDate;

  // 날짜 차이를 일수로 변환하고 절대값으로 반환
  const dayDiff = Math.abs(Math.floor(timeDiff / (1000 * 60 * 60 * 24))); // 밀리초를 일수로 변환 후 절대값

  return dayDiff; // D-몇일 남았는지 절대값으로 반환
};

// 🔸 기념일 생성
router.post("/", auth, async (req, res) => {
  try {
    const { title, date } = req.body;
    const memberId = req.memberId;
    console.log("받은 데이터:", { title, date, memberId });
    const user = await User.findOne({ memberId });

    if (!user || !user.connected || !user.coupleId) {
      return res
        .status(400)
        .json({ message: "커플 연결이 되어있지 않습니다." });
    }

    const days = getDaysUntilAnniversary(date);

    // 1) 일단 anniversaryId 없이 먼저 저장
    let anniversary = new Anniversary({
      title,
      date,
      ownerId: user._id.toString(),
      coupleId: user.coupleId.toString(),
      days,
    });

    anniversary = await anniversary.save();

    // 2) 저장 후 생성된 _id를 anniversaryId로 업데이트
    anniversary.anniversaryId = anniversary._id.toString();
    await anniversary.save();

    res.status(201).json(anniversary);
  } catch (err) {
    console.error("❌ 서버 오류:", err);
    res.status(500).json({ message: "기념일 생성 실패" });
  }
});

// 🔸 기념일 전체 조회
router.get("/", auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    console.log("memberId:", memberId);

    const user = await User.findOne({ memberId });
    console.log("user:", user);

    if (!user || !user.connected || !user.coupleId) {
      return res
        .status(400)
        .json({ message: "커플 연결이 되어있지 않습니다." });
    }

    // coupleId를 string 그대로 사용
    const coupleId = user.coupleId;
    console.log("coupleId (string):", coupleId);

    const anniversaries = await Anniversary.find({ coupleId });
    console.log("anniversaries:", anniversaries);

    const anniversariesWithDays = anniversaries.map((anniversary) => {
      const days = getDaysUntilAnniversary(anniversary.date);
      return {
        ...anniversary.toObject(),
        days,
      };
    });

    res.json(anniversariesWithDays);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "기념일 조회 실패" });
  }
});

// 🔸 기념일 수정
router.put("/anniversaries/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title, date } = req.body;

  try {
    const updatedAnniversary = await Anniversary.findOneAndUpdate(
      { _id: id, coupleId: req.coupleId },
      { title, date },
      { new: true }
    );

    if (!updatedAnniversary) {
      return res.status(404).json({ message: "기념일을 찾을 수 없습니다." });
    }

    res.status(200).json(updatedAnniversary);
  } catch (err) {
    console.error("기념일 수정 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 🔸 기념일 단일 조회 (id로)
router.get("/anniversaryedit/:id", auth, async (req, res) => {
  const { id } = req.params;
  console.log("🔍 요청 받은 id:", id);
  console.log("🔐 JWT에서 추출한 coupleId:", req.coupleId);

  try {
    const anniversary = await Anniversary.findOne({
      _id: id,
      coupleId: req.coupleId,
    });

    if (!anniversary) {
      console.log("❌ 기념일을 찾지 못했습니다.");
      return res.status(404).json({ message: "기념일을 찾을 수 없습니다." });
    }

    res.status(200).json(anniversary);
  } catch (err) {
    console.error("기념일 조회 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});
router.delete("/anniversarydelete/:id", auth, async (req, res) => {
  const { id } = req.params;
  const coupleId = req.coupleId; // 미들웨어에서 req에 할당된 coupleId

  try {
    const deleted = await Anniversary.findOneAndDelete({ _id: id, coupleId });

    if (!deleted) {
      return res.status(404).json({ message: "기념일을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "기념일이 삭제되었습니다." });
  } catch (err) {
    console.error("기념일 삭제 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
