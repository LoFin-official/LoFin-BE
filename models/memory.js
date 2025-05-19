const mongoose = require("mongoose");

const MemorySchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
    },
    coupleId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: [String], // 여러 이미지 URL 배열로 변경
      default: [],
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    rotation: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

module.exports = mongoose.model("Memory", MemorySchema);
