// scripts/seedGiftItems.js
require("dotenv").config();
const mongoose = require("mongoose");
const GiftItem = require("../models/giftItem");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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
    recommendation: "기념일날 선물하기 좋은 아이템이에요",
    keywords: ["기념일"],
  },
  {
    category: "편지지",
    productName:
      "프롬화이트 / 화이트젤펜 + 4종 고급 편지지세트 1set DAILY BRIDGE",
    recommendation: "특별한 날을 위한 로맨틱한 선택이에요",
    keywords: ["기념일"],
  },
  {
    category: "프리저브드플라워",
    productName: "뷰티풀데코센스 생화 프리저브드 꽃다발 + 쇼핑백",
    recommendation: "심플하면서도 감성적인 아이템이에요",
    keywords: ["기념일"],
  },
  {
    category: "홈파티세트",
    productName:
      "포근 라이프 100일 파티 백일 상차림 세트 풍선 가랜드 백일 파티",
    recommendation: "100일날 이벤트하기 좋은 상품이에요.",
    keywords: ["100일"],
  },
  {
    category: "편지지",
    productName: "라알레그리아 LED 유리병 꽃다발 편지지 세트, 분홍장미, 1세트",
    recommendation: "기념일날 선물하기 좋은 아이템이에요",
    keywords: ["100일"],
  },
  {
    category: "무드등",
    productName:
      "led 유리돔 미녀와야수 홀로그램 장미 어버이날 로즈데이 100일 여자친구 선물 화이트데이 발렌타인데이",
    recommendation: "심플하면서도 감성적인 아이템이에요",
    keywords: ["100일"],
  },
  {
    category: "혼합풍선세트",
    productName: "베르트폴 200일 파티 기념일 대형 풍선세트",
    recommendation: "기념일날 이벤트하기 좋은 상품이에요.",
    keywords: ["200일"],
  },
  {
    category: "혼합풍선세트",
    productName: "곰돌이푸 기념일 파티 풍선 세트, 200일, 1세트",
    recommendation: "특별한 날을 위한 로맨틱한 선택이에요",
    keywords: ["200일"],
  },
  {
    category: "파티픽",
    productName:
      "메리드로우 200일 토퍼 기념일 만난지200일 선물 커플 연인 케이크토퍼",
    recommendation: "심플하면서도 감성적인 아이템이에요",
    keywords: ["200일"],
  },
  {
    category: "편지지",
    productName: "아르띠콜로 행복 LED 유리병 꽃다발 편지지 세트",
    recommendation: "기념일날 선물하기 좋은 아이템이에요",
    keywords: ["1주년"],
  },
  {
    category: "편지지",
    productName: "손하트 편지지 8p + 봉투 4p 세트, 사랑해요 + 랜덤 ..., 1세트",
    recommendation: "특별한 날을 위한 로맨틱한 선택이에요",
    keywords: ["1주년"],
  },
  {
    category: "노트",
    productName:
      "커플 100문100답 커플질문 커플문답책 커플시험지 커플책 러브장 2개 노트",
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
