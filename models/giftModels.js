const mongoose = require("mongoose");

/**
 * 상품 정보 스키마
 * 쿠팡 등에서 크롤링한 상품 정보를 저장
 */
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  source: {
    type: String,
    default: "쿠팡",
    index: true,
  },
  mallName: {
    type: String,
    default: "쿠팡",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 24시간 후 자동 삭제
  },
});

/**
 * 사용자 관심 카테고리 스키마
 * 사용자의 선호도와 관심사를 저장
 */
const userPreferenceSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  categories: [
    {
      type: String,
      trim: true,
    },
  ],
  keywords: [
    {
      type: String,
      trim: true,
    },
  ],
  priceRange: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 500000,
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

/**
 * 검색 기록 스키마
 * 사용자의 선물 검색 기록을 저장
 */
const searchHistorySchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    index: true,
  },
  keyword: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// 30일 후 자동 삭제 인덱스 추가
searchHistorySchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

/**
 * 추천 상품 스키마
 * 사용자 맞춤형 추천 상품 목록을 캐싱
 */
const recommendationSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    index: true,
  },
  partnerId: {
    type: String,
    index: true,
  },
  occasion: {
    type: String,
    default: "기념일",
    index: true,
  },
  products: [
    {
      title: String,
      price: Number,
      image: String,
      link: String,
      category: String,
      source: String,
      mallName: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // 1시간 후 자동 삭제
  },
});

// 모델 생성
const Product = mongoose.model("Product", productSchema);
const UserPreference = mongoose.model("UserPreference", userPreferenceSchema);
const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);
const Recommendation = mongoose.model("Recommendation", recommendationSchema);

module.exports = {
  Product,
  UserPreference,
  SearchHistory,
  Recommendation,
};
