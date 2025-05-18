const express = require("express");
const router = express.Router();
const { UserCategorySelection } = require("../models/wishlistmodels");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// 상대방 위시리스트 기반 추천 3가지 (카테고리 기반 추천)
router.get("/wishlist", auth, async (req, res) => {
  try {
    // 현재 사용자 조회
    const user = await User.findOne({ memberId: req.memberId });
    const partnerId = user?.partnerId;

    console.log("내 memberId:", req.memberId);
    console.log("상대방 partnerId (memberId):", partnerId);

    if (!partnerId) {
      return res.status(404).json({ message: "상대방이 없습니다." });
    }

    // 상대방 정보 조회 (닉네임 포함)
    const partnerUser = await User.findOne({ memberId: partnerId });
    if (!partnerUser) {
      return res
        .status(404)
        .json({ message: "상대방 정보를 찾을 수 없습니다." });
    }

    const partnerNickname = partnerUser.nickname || "상대방";

    // 상대방 위시리스트 가져오기
    const partnerWishlist = await UserCategorySelection.findOne({
      memberId: partnerId.toString(),
    });

    console.log("상대방 위시리스트:", partnerWishlist);

    if (!partnerWishlist || !partnerWishlist.selectedCategories.length) {
      return res
        .status(404)
        .json({ message: "상대방의 위시리스트가 없습니다." });
    }

    // 위시리스트에서 상위 3개 카테고리 정보 가져오기
    const top3Categories = partnerWishlist.selectedCategories.slice(0, 3);

    // 추천할 선물 아이디어 배열 생성
    const recommendedGifts = top3Categories.map((category) => ({
      mainCategory: category.mainCategory,
      subCategory: category.subCategory,
      details: category.details,
    }));

    if (recommendedGifts.length === 0) {
      return res
        .status(404)
        .json({ message: "추천할 선물 아이디어가 없습니다." });
    }

    // 응답에 닉네임 포함
    res.json({
      success: true,
      partnerName: partnerNickname,
      recommended: recommendedGifts,
    });
  } catch (err) {
    console.error("위시리스트 추천 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
