const express = require("express");
const router = express.Router();
const { UserCategorySelection } = require("../models/wishlistmodels");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// 상대방 위시리스트 기반 추천 3가지 (카테고리 기반 추천)
router.get("/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findOne({ memberId: req.memberId });
    const partnerId = user?.partnerId;

    console.log("내 memberId:", req.memberId);
    console.log("상대방 partnerId (memberId):", partnerId);

    if (!partnerId) {
      return res.status(404).json({ message: "상대방이 없습니다." });
    }

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

    // 추천할 선물 아이디어를 저장할 배열
    const recommendedGifts = [];

    // 각 카테고리별 정보만 추출
    for (const category of top3Categories) {
      const giftIdea = {
        mainCategory: category.mainCategory,
        subCategory: category.subCategory,
        details: category.details,
      };

      recommendedGifts.push(giftIdea); // 추천 아이디어에 카테고리 정보 추가
    }

    // 추천할 선물 아이디어가 없다면 에러 메시지
    if (recommendedGifts.length === 0) {
      return res
        .status(404)
        .json({ message: "추천할 선물 아이디어가 없습니다." });
    }

    // 추천된 선물 아이디어 반환
    res.json({
      success: true,
      recommended: recommendedGifts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
