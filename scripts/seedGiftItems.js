// scripts/seedGiftItems.js
require("dotenv").config();
const mongoose = require("mongoose");
const GiftItem = require("../models/giftItem");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding");
    // ...
  } catch (err) {
    console.error(err);
  }
}

seed();
const seedData = [
  {
    category: "편지지",
    productName: "라알레그리아 LED 유리병 꽃다발 편지지 세트, 분홍장미, 1세트",
    recommendation: "기념일날 이벤트하기 좋은 상품이에요.",
    keywords: ["기념일"],
  },
  {
    category: "편지지",
    productName: "아르띠콜로 행복 LED 유리병 꽃다발 편지지 세트",
    recommendation: "기념일날 선물하기 좋은 아이템이에요",
    keywords: ["기념일"],
  },
  {
    category: "프리저브드플라워",
    productName: "루카스 유리돔 기념일선물꽃다발 인테리어무드등",
    recommendation: "심플하면서도 감성적인 아이템이에요",
    keywords: ["기념일"],
  },
  {
    category: "편지지",
    productName: "라알레그리아 LED 유리병 꽃다발 편지지 세트, 분홍장미, 1세트",
    recommendation: "100일날 이벤트하기 좋은 상품이에요.",
    keywords: ["100일"],
  },
  {
    category: "편지지",
    productName: "아르띠콜로 행복 LED 유리병 꽃다발 편지지 세트",
    recommendation: "기념일날 선물하기 좋은 아이템이에요",
    keywords: ["100일"],
  },
  {
    category: "프리저브드플라워",
    productName: "루카스 유리돔 기념일선물꽃다발 인테리어무드등",
    recommendation: "심플하면서도 감성적인 아이템이에요",
    keywords: ["100일"],
  },
  {
    category: "파티픽",
    productName:
      "메리드로우 200일 토퍼 기념일 만난지200일 선물 커플 연인 케이크토퍼",
    recommendation: "기념일날 이벤트하기 좋은 상품이에요.",
    keywords: ["200일"],
  },
  {
    category: "편지지",
    productName: "라알레그리아 LED 유리병 꽃다발 편지지 세트, 분홍장미, 1세트",
    recommendation: "특별한 날을 위한 로맨틱한 선택이에요",
    keywords: ["200일"],
  },
  {
    category: "파티픽",
    productName: "스위트레터링 해피 200일 이백일 기념 케이크 꽃 토퍼",
    recommendation: "심플하면서도 감성적인 아이템이에요",
    keywords: ["200일"],
  },
  {
    category: "편지지",
    productName: "라알레그리아 LED 유리병 꽃다발 편지지 세트, 분홍장미, 1세트",
    recommendation: "1주년 이벤트하기 좋은 상품이에요.",
    keywords: ["1주년"],
  },
  {
    category: "편지지",
    productName: "아르띠콜로 행복 LED 유리병 꽃다발 편지지 세트",
    recommendation: "기념일날 선물하기 좋은 아이템이에요",
    keywords: ["1주년"],
  },
  {
    category: "프리저브드플라워",
    productName: "루카스 유리돔 기념일선물꽃다발 인테리어무드등",
    recommendation: "심플하면서도 감성적인 아이템이에요",
    keywords: ["1주년"],
  },
];

GiftItem.insertMany(seedData)
  .then(() => {
    console.log("Gift items inserted");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error inserting gift items:", err);
  });
