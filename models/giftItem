// models/giftItem.js
const mongoose = require("mongoose");

const giftItemSchema = new mongoose.Schema({
  category: String,
  productName: String,
  recommendation: String,
  keywords: [String], // 여기에 '기념일', '100일', '1주년' 등 키워드 배열로 저장
});

module.exports = mongoose.model("GiftItem", giftItemSchema);
