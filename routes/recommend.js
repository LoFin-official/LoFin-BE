const express = require("express");
const router = express.Router();
const { UserCategorySelection } = require("../models/wishlistmodels");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const scrapeGmarket = require("../crawler/coupangScraper"); // 크롤링 함수

router.get("/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findOne({ memberId: req.memberId });
    const partnerId = user?.partnerId;

    if (!partnerId) {
      return res.status(404).json({ message: "상대방이 없습니다." });
    }

    const partnerUser = await User.findOne({ memberId: partnerId });
    if (!partnerUser) {
      return res
        .status(404)
        .json({ message: "상대방 정보를 찾을 수 없습니다." });
    }

    const partnerNickname = partnerUser.nickname || "상대방";

    const partnerWishlist = await UserCategorySelection.findOne({
      memberId: partnerId.toString(),
    });

    if (!partnerWishlist || !partnerWishlist.selectedCategories.length) {
      return res
        .status(404)
        .json({ message: "상대방의 위시리스트가 없습니다." });
    }

    const top3Categories = partnerWishlist.selectedCategories.slice(0, 3);
    const results = [];

    for (const category of top3Categories) {
      const keyword = category.details?.trim();
      if (keyword) {
        const searchKeyword = `커플 ${keyword} 선물`; // 🔹 키워드에 "선물" 붙이기
        const items = await scrapeGmarket(searchKeyword); // 여기서 붙은 키워드로 크롤링
        if (items.length > 0) {
          results.push({
            detail: keyword, // 원래 키워드 (UI 표시용)
            product: items[0], // 크롤링된 첫 번째 상품명
          });
        }
      }
    }

    res.json({
      success: true,
      partnerName: partnerNickname,
      recommended: results,
    });
  } catch (err) {
    console.error("추천 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
