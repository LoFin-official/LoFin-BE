const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Sticker = require("../models/sticker");
const auth = require("../middleware/authMiddleware"); // 인증 미들웨어

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ 이모티콘 이미지 업로드 및 저장
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  try {
    const imageUrl = `/uploads/${req.file.filename}`;

    const sticker = new Sticker({
      memberId: req.memberId, // 인증 미들웨어에서 설정
      coupleId: req.coupleId, // 인증 미들웨어에서 설정
      imageUrl,
    });

    await sticker.save();
    res.json({ success: true, sticker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 이모티콘 목록 조회
router.get("/", auth, async (req, res) => {
  try {
    const stickers = await Sticker.find({ coupleId: req.coupleId });
    res.json({ success: true, stickers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
