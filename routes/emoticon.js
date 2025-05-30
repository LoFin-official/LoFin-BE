const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Sticker = require("../models/sticker");
const auth = require("../middleware/authMiddleware"); // 인증 미들웨어

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.resolve(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."));
    }
  },
});

// 이모티콘 이미지 업로드 및 저장
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "이미지 파일이 필요합니다." });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const sticker = new Sticker({
      memberId: req.memberId,
      coupleId: req.coupleId,
      imageUrl,
    });

    await sticker.save();
    res.json({ success: true, sticker });
  } catch (err) {
    console.error("이모티콘 저장 실패:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 이모티콘 목록 조회
router.get("/", auth, async (req, res) => {
  try {
    const stickers = await Sticker.find({ coupleId: req.coupleId });
    res.json({ success: true, stickers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.delete("/:id", auth, async (req, res) => {
  const coupleId = req.coupleId; // coupleId 기준으로 권한 체크
  const { id } = req.params;

  try {
    // coupleId 소유 스티커인지 확인
    const sticker = await Sticker.findOne({ _id: id, coupleId });

    if (!sticker) {
      return res
        .status(404)
        .json({ success: false, message: "스티커를 찾을 수 없습니다." });
    }

    // 삭제 처리
    await Sticker.deleteOne({ _id: id });

    return res.json({ success: true, message: "스티커가 삭제되었습니다." });
  } catch (err) {
    console.error("스티커 삭제 오류:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
