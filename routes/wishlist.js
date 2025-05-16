const express = require("express");
const router = express.Router();
const { Category, UserCategorySelection } = require("../models/wishlistmodels");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const mongoose = require("mongoose");

// ✅ 모든 카테고리 조회
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ✅ 서브카테고리 조회
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

    const partnerId = await getPartnerIdFromMemberId(memberId); // ObjectId 또는 null

    let selection = await UserCategorySelection.findOne({
      memberId,
      partnerId, // ObjectId 또는 null로 쿼리 가능
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

    selection.wishlistId = selection._id.toString();
    selection.lastUpdated = Date.now();
    await selection.save();

    res.status(200).json({
      message: "카테고리 선택이 저장되었습니다",
      selection: {
        wishlistId: selection._id.toString(),
        ...selection.toObject(),
      },
    });
  } catch (err) {
    console.error("카테고리 선택 저장 중 에러:", err); // 전체 에러 객체 로그
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// ✅ 선택 완료
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

// ✅ 선택 건너뛰기
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

module.exports = router;
