const mongoose = require("mongoose");

// 카테고리 스키마 정의
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subcategories: [
    {
      type: String,
      required: true,
    },
  ],
  subDetails: {
    type: Map,
    of: [String],
  },
});

// 사용자 카테고리 선택 상태 스키마
const userCategorySelectionSchema = new mongoose.Schema(
  {
    wishlistId: {
      type: String,
      unique: true,
      default: null,
    },
    memberId: {
      // 기존 userId를 memberId로 변경
      type: String, // ObjectId에서 String으로 변경
      required: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    selectedCategories: [
      {
        mainCategory: String,
        subCategory: String,
        details: { type: String, required: false }, // 세부사항 필드 추가
      },
    ],
    selectionCompleted: {
      type: Boolean,
      default: false,
    },
    skipped: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "addedAt", updatedAt: "updatedAt" }, // addedAt, updatedAt 자동 관리
  }
);

// 모델 생성
const Category = mongoose.model("Category", categorySchema);
const UserCategorySelection = mongoose.model(
  "UserCategorySelection",
  userCategorySelectionSchema
);

module.exports = {
  Category,
  UserCategorySelection,
};
