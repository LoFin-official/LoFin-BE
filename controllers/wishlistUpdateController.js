const { UserCategorySelection } = require("../models/wishlistmodels");

const updateWishlistItem = async (req, res) => {
  try {
    const { selectedCategories, details } = req.body;
    const memberId = req.memberId;

    if (
      !selectedCategories ||
      !Array.isArray(selectedCategories) ||
      selectedCategories.length === 0
    ) {
      return res.status(400).json({ message: "선택된 카테고리가 없습니다." });
    }

    if (!details || typeof details !== "object") {
      return res.status(400).json({ message: "세부 정보가 없습니다." });
    }

    let selection = await UserCategorySelection.findOne({ memberId });
    if (!selection) {
      return res
        .status(404)
        .json({ message: "위시리스트를 찾을 수 없습니다." });
    }

    // 삭제된 항목 식별 및 제거
    selection.selectedCategories = selection.selectedCategories.filter(
      (existingCategory) => {
        return selectedCategories.some((updatedCategory) => {
          return (
            updatedCategory.mainCategory === existingCategory.mainCategory &&
            updatedCategory.subCategories.some(
              (sub) => existingCategory.subCategory === sub
            )
          );
        });
      }
    );

    // 세부 정보 업데이트
    selectedCategories.forEach(({ mainCategory, subCategories }) => {
      subCategories.forEach((subCategory) => {
        const newDetails = details[subCategory];
        if (newDetails) {
          const categoryIndex = selection.selectedCategories.findIndex(
            (cat) =>
              cat.mainCategory === mainCategory &&
              cat.subCategory === subCategory
          );
          if (categoryIndex !== -1) {
            selection.selectedCategories[categoryIndex].details = newDetails;
          }
        }
      });
    });

    selection.lastUpdated = Date.now();
    await selection.save();

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
