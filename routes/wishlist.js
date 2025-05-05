const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {
  Category,
  UserCategorySelection, // WishlistItem 제거
} = require("../models/wishlistmodels");
const auth = require("../middleware/authMiddleware"); // 인증 미들웨어 사용 가정

// 모든 카테고리 조회
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error("카테고리 조회 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// 특정 카테고리의 서브카테고리 조회
router.get("/categories/:categoryName", async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.categoryName });
    if (!category) {
      return res.status(404).json({ message: "카테고리를 찾을 수 없습니다" });
    }
    res.json(category.subcategories);
  } catch (err) {
    console.error("서브카테고리 조회 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// 사용자 카테고리 선택 상태 조회
// 카테고리 선택 저장
// 카테고리 선택 저장
router.post("/selection", auth, async (req, res) => {
  try {
    const { selectedCategories } = req.body;

    if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
      return res.status(400).json({
        message: "선택된 카테고리가 없습니다",
      });
    }

    const memberId = req.memberId;

    if (!memberId) {
      return res.status(400).json({ message: "사용자 정보가 없습니다" });
    }

    let selection = await UserCategorySelection.findOne({ memberId });

    if (!selection) {
      selection = new UserCategorySelection({
        memberId,
        selectedCategories: [],
        selectionCompleted: false,
        skipped: false,
      });
    }

    selectedCategories.forEach(({ mainCategory, subCategories }) => {
      if (!mainCategory || !Array.isArray(subCategories)) return;

      subCategories.forEach((subCategory) => {
        let details = req.body.details?.[subCategory] || subCategory;

        const exists = selection.selectedCategories.some(
          (cat) =>
            cat.mainCategory === mainCategory && cat.subCategory === subCategory
        );
        if (!exists) {
          selection.selectedCategories.push({
            mainCategory,
            subCategory,
            details,
          });
        }
      });
    });

    // _id 기반으로 wishlistId 설정 후 다시 저장
    selection.wishlistId = selection._id.toString();
    selection.lastUpdated = Date.now();

    await selection.save();

    const selectionWithWishlistIdAtTop = {
      wishlistId: selection._id.toString(),
      addedAt: selection.addedAt,
      updatedAt: selection.updatedAt,
      ...selection.toObject(),
    };

    res.status(200).json({
      message: "카테고리 선택이 저장되었습니다",
      selection: selectionWithWishlistIdAtTop,
    });
  } catch (err) {
    console.error("카테고리 선택 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// 카테고리 선택 완료
router.post("/selection/complete", auth, async (req, res) => {
  try {
    let selection = await UserCategorySelection.findOne({
      memberId: req.memberId,
    });

    if (!selection) {
      selection = new UserCategorySelection({
        memberId: req.memberId,
        selectedCategories: [],
        selectionCompleted: true,
        skipped: false,
      });
    } else {
      selection.selectionCompleted = true;
      selection.lastUpdated = Date.now();
    }

    // _id 기반으로 wishlistId 설정 후 다시 저장
    selection.wishlistId = selection._id.toString(); // _id를 wishlistId로 설정

    await selection.save();

    // wishlistId를 맨 위로 배치하여 응답
    const selectionWithWishlistIdAtTop = {
      wishlistId: selection._id.toString(),
      ...selection.toObject(), // 나머지 필드들
    };

    res.status(200).json({
      message: "카테고리 선택이 완료되었습니다",
      selection: selectionWithWishlistIdAtTop,
    });
  } catch (err) {
    console.error("카테고리 선택 완료 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// 카테고리 선택 건너뛰기
router.post("/selection/skip", auth, async (req, res) => {
  try {
    if (!req.memberId) {
      return res.status(400).json({ message: "사용자 정보가 없습니다" });
    }

    let selection = await UserCategorySelection.findOne({
      memberId: req.memberId,
    });

    if (!selection) {
      selection = new UserCategorySelection({
        memberId: req.memberId,
        selectedCategories: [],
        selectionCompleted: false,
        skipped: true,
      });
    } else {
      selection.skipped = true;
      selection.lastUpdated = Date.now();
    }

    // _id 기반으로 wishlistId 설정 후 다시 저장
    selection.wishlistId = selection._id.toString(); // _id를 wishlistId로 설정

    await selection.save();

    // wishlistId를 맨 위로 배치하여 응답
    const selectionWithWishlistIdAtTop = {
      wishlistId: selection._id.toString(),
      ...selection.toObject(), // 나머지 필드들
    };

    res.status(200).json({
      message: "카테고리 선택을 건너뛰었습니다",
      selection: selectionWithWishlistIdAtTop,
    });
  } catch (err) {
    console.error("카테고리 선택 건너뛰기 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

module.exports = router;
