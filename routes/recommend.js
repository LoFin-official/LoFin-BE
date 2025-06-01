const express = require("express");
const router = express.Router();
const { UserCategorySelection } = require("../models/wishlistmodels");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const scrapeGmarket = require("../crawler/coupangScraper"); // 크롤링 함수
const recommendGiftByFirstMet = require("../crawler/recommendGiftByDday");

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
        const searchKeyword = `커플 ${keyword} 선물`; // 키워드에 "선물" 붙이기
        const items = await scrapeGmarket(searchKeyword); // 크롤링 실행
        if (items.length > 0) {
          results.push({
            detail: keyword, // UI용 원래 키워드
            product: items[0], // 첫 번째 상품명 1개만 사용
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

router.get("/dday", auth, async (req, res) => {
  try {
    const memberId = req.memberId;

    const user = await User.findOne({ memberId });

    if (!user || !user.firstMetDate) {
      return res
        .status(404)
        .json({ message: "처음 만난 날짜가 설정되지 않았습니다." });
    }

    const recommendation = await recommendGiftByFirstMet(user.firstMetDate);

    if (
      !recommendation ||
      !recommendation.giftList ||
      recommendation.giftList.length === 0
    ) {
      return res
        .status(200)
        .json({ message: "다가오는 D-day 기념일이 없습니다." });
    }

    res.json({
      dday: recommendation.dday,
      keyword: recommendation.keyword,
      recommended: recommendation.giftList, // 최대 3개 상품 배열로 전달
    });
  } catch (error) {
    console.error("추천 실패:", error);
    res.status(500).json({ message: "추천 실패", error: error.message });
  }
});

module.exports = router;
