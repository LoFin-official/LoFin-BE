// models/Sticker.js
const mongoose = require("mongoose");

const stickerSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
  },
  coupleId: {
    type: String, // User 모델에서 사용 중인 문자열 타입
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Sticker", stickerSchema);
