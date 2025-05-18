const { UserCategorySelection } = require("../models/wishlistmodels");
const User = require("../models/User");

// controllers/wishlistController.js
const getWishlist = async (req, res) => {
  try {
    const memberId = req.memberId; // auth 미들웨어에서 넣어준 memberId

    if (!memberId) {
      return res
        .status(400)
        .json({ success: false, message: "사용자 정보가 없습니다." });
    }

    // memberId로 위시리스트 찾기
    const wishlist = await UserCategorySelection.findOne({ memberId });

    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "위시리스트가 존재하지 않습니다." });
    }

    res.json({
      success: true,
      selectedCategories: wishlist.selectedCategories || [],
      details: wishlist.details || {}, // details가 스키마에 있다면
    });
  } catch (error) {
    console.error("위시리스트 조회 중 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류로 위시리스트를 불러오지 못했습니다.",
    });
  }
};

const updateWishlistItem = async (req, res) => {
  try {
    const memberId = req.memberId;
    const { selectedCategories, details } = req.body;

    if (!memberId) {
      return res
        .status(400)
        .json({ success: false, message: "사용자 정보가 없습니다." });
    }

    // 기존 데이터가 있으면 업데이트, 없으면 새로 생성
    const updated = await UserCategorySelection.findOneAndUpdate(
      { memberId },
      { selectedCategories, details },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "위시리스트가 성공적으로 업데이트 되었습니다.",
      updated,
    });
  } catch (error) {
    console.error("위시리스트 업데이트 중 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류로 위시리스트 업데이트에 실패했습니다.",
    });
  }
};

module.exports = {
  getWishlist,
  updateWishlistItem,
};
