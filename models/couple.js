const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  coupleCode: {
    type: String,
    unique: true, // 코드가 유니크하도록 설정
    required: true, // 반드시 존재해야 함
  },
  connected: {
    type: Boolean,
    default: false, // 커플 연결 여부
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
