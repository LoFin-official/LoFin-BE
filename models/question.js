const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  memberId: { type: String, required: true },
  coupleId: {
    type: String, // 혹은 String 타입
    required: false, // 필수 아님으로 변경
  },
});

module.exports = mongoose.model("Question", questionSchema);
