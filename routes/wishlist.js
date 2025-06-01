const express = require("express");
const router = express.Router();
const { Category, UserCategorySelection } = require("../models/wishlistmodels");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const mongoose = require("mongoose");

//  모든 카테고리 조회
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

//  서브카테고리 조회
router.get("/categories/:categoryName", async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.categoryName });
    if (!category) {
      return res.status(404).json({ message: "카테고리를 찾을 수 없습니다" });
    }
    res.json(category.subcategories);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

async function getPartnerIdFromMemberId(memberId) {
  const user = await User.findOne({ memberId });
  if (!user) return null;
  return user.partnerId || null; // ObjectId 또는 null
}

// selection 저장 예시
router.post("/selection", auth, async (req, res) => {
  try {
    const { selectedCategories } = req.body;
    const memberId = req.memberId;

    if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
      return res.status(400).json({ message: "선택된 카테고리가 없습니다" });
    }

    const partnerId = await getPartnerIdFromMemberId(memberId);

    let selection = await UserCategorySelection.findOne({
      memberId,
      partnerId,
    });

    if (!selection) {
      selection = new UserCategorySelection({
        memberId,
        partnerId,
        selectedCategories: [],
        selectionCompleted: false,
        skipped: false,
      });
    }

    // 기존 선택 배열 덮어쓰기
    const newSelectedCategories = [];

    selectedCategories.forEach(({ mainCategory, subCategories }) => {
      if (!mainCategory || !Array.isArray(subCategories)) return;

      subCategories.forEach((subCategory) => {
        let details = req.body.details?.[subCategory] || subCategory;

        newSelectedCategories.push({
          mainCategory,
          subCategory,
          details,
        });
      });
    });

    selection.selectedCategories = newSelectedCategories;
    selection.selectionCompleted = false; // 필요 시 상태 초기화
    selection.skipped = false;
    selection.lastUpdated = Date.now();
    selection.wishlistId = selection._id.toString();

    await selection.save();

    res.status(200).json({
      message: "카테고리 선택이 저장되었습니다",
      selection: {
        wishlistId: selection._id.toString(),
        ...selection.toObject(),
      },
    });
  } catch (err) {
    console.error("카테고리 선택 저장 중 에러:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

//  선택 완료
router.post("/selection/complete", auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const partnerId = (await getPartnerIdFromMemberId(memberId)) || null;

    let selection = await UserCategorySelection.findOne({
      memberId,
      partnerId,
    });

    if (!selection) {
      selection = new UserCategorySelection({
        memberId,
        partnerId,
        selectedCategories: [],
        selectionCompleted: true,
        skipped: false,
      });
    } else {
      selection.selectionCompleted = true;
      selection.lastUpdated = Date.now();
    }

    selection.wishlistId = selection._id.toString();
    await selection.save();

    res.status(200).json({
      message: "카테고리 선택이 완료되었습니다",
      selection: {
        wishlistId: selection._id.toString(),
        ...selection.toObject(),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

//  선택 건너뛰기
router.post("/selection/skip", auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const partnerId = (await getPartnerIdFromMemberId(memberId)) || null;

    let selection = await UserCategorySelection.findOne({
      memberId,
      partnerId,
    });

    if (!selection) {
      selection = new UserCategorySelection({
        memberId,
        partnerId,
        selectedCategories: [],
        selectionCompleted: false,
        skipped: true,
      });
    } else {
      selection.selectedCategories = []; // 기존 선택 제거
      selection.selectionCompleted = false;
      selection.skipped = true;
      selection.lastUpdated = Date.now();
    }

    selection.wishlistId = selection._id.toString();
    await selection.save();

    res.status(200).json({
      message: "카테고리 선택을 건너뛰었습니다",
      selection: {
        wishlistId: selection._id.toString(),
        ...selection.toObject(),
      },
    });
  } catch (err) {
    console.error("Wishlist 저장 중 에러:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});
// 사용자 위시리스트 선택 데이터 조회
router.get("/selection", auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const partnerId = (await getPartnerIdFromMemberId(memberId)) || null;

    let selection = await UserCategorySelection.findOne({
      memberId,
      partnerId,
    });

    if (!selection) {
      return res.status(404).json({ message: "선택된 카테고리가 없습니다." });
    }

    res.status(200).json({
      message: "선택된 카테고리 조회 성공",
      selection: {
        wishlistId: selection._id.toString(),
        ...selection.toObject(),
      },
    });
  } catch (err) {
    console.error("선택 데이터 조회 중 에러:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

module.exports = router;
