const mongoose = require("mongoose");

const anniversarySchema = new mongoose.Schema(
  {
    anniversaryId: { type: String }, // _id를 문자열로 저장
    title: { type: String, required: true },
    date: { type: Date, required: true },
    ownerId: { type: String, required: true },
    coupleId: { type: String, required: true },
    days: { type: Number }, // D-day 계산값 저장
  },
  {
    timestamps: true,
  }
);

// _id가 생성되면 anniversaryId에 자동 할당
anniversarySchema.pre("save", function (next) {
  if (!this.anniversaryId) {
    this.anniversaryId = this._id.toString();
  }
  next();
});

module.exports = mongoose.model("Anniversary", anniversarySchema);
