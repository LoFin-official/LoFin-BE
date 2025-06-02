const mongoose = require("mongoose");

const MemorySchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true },
    coupleId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: [String], default: [] },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    rotation: { type: Number, default: 0 },

    styleType: { type: String, default: "default" }, // 예: 'polaroid', 'note', 'plain' 등

    memoryDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Memory", MemorySchema);
