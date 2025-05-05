const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      unique: true,
      default: null,
    },
    loginId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickname: { type: String, default: "" },
    birth: { type: Date, default: null },
    profilePicture: { type: String, default: "" },
    coupleCode: {
      type: String,
      default: null, // unique 제약을 제거하고 default null로 변경
    },
    connected: {
      type: Boolean,
      default: false,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    firstMetDate: {
      type: Date,
      default: null,
    },
    coupleId: { type: String, default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 모델 생성
module.exports = mongoose.model("User", userSchema);
