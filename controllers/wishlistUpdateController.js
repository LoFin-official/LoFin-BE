const { UserCategorySelection } = require("../models/wishlistmodels");
const User = require("../models/User");

const updateWishlistItem = async (req, res) => {
  try {
    const { selectedCategories, details = {} } = req.body;
    const memberId = req.memberId;

    // 유효성 검사
    if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
      return res.status(400).json({ message: "선택된 카테고리가 없습니다." });
    }

    // 사용자 정보 조회 (partnerId 자동 조회)
    const user = await User.findOne({ memberId });
    if (!user || !user.partnerId) {
      return res.status(400).json({ message: "상대방 정보가 없습니다." });
    }

    const partnerId = user.partnerId;

    // 기존 선택 내역 조회
    let selection = await UserCategorySelection.findOne({
      memberId,
      partnerId,
    });
    if (!selection) {
      return res
        .status(404)
        .json({ message: "위시리스트를 찾을 수 없습니다." });
    }

    // 선택된 항목만 유지하도록 갱신
    const updatedItems = [];

    selectedCategories.forEach(({ mainCategory, subCategories }) => {
      if (!mainCategory || !Array.isArray(subCategories)) return;

      subCategories.forEach((subCategory) => {
        const detail = details[subCategory] || subCategory;

        updatedItems.push({
          mainCategory,
          subCategory,
          details: detail,
        });
      });
    });

    // 전체 selectedCategories 업데이트
    selection.selectedCategories = updatedItems;
    selection.partnerId = partnerId;
    selection.lastUpdated = Date.now();
    selection.wishlistId = selection._id.toString(); // 갱신 보장

    await selection.save();

    // 응답 구조
    const selectionWithWishlistIdAtTop = {
      wishlistId: selection._id.toString(),
      ...selection.toObject(),
    };

    res.status(200).json({
      message: "위시리스트 항목이 수정되었습니다.",
      selection: selectionWithWishlistIdAtTop,
    });
  } catch (err) {
    console.error("위시리스트 항목 수정 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = { updateWishlistItem };
