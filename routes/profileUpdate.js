const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

// 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."));
    }
  },
});

// ✅ 프로필 정보 가져오기 (초기 데이터 요청용)
router.get("/", authenticate, async (req, res) => {
  const memberId = req.memberId;

  try {
    const user = await User.findById(memberId).select(
      "nickname birth profilePicture"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("프로필 조회 실패:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "프로필 조회 실패",
        error: err.message,
      });
  }
});

// ✅ 프로필 수정
router.put(
  "/update",
  authenticate,
  upload.single("profilePicture"),
  async (req, res) => {
    const { nickname, birth } = req.body;
    const memberId = req.memberId;

    const birthdateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (birth && !birth.match(birthdateFormat)) {
      return res.status(400).json({
        success: false,
        message:
          "생년월일 형식이 잘못되었습니다. yyyy-mm-dd 형식으로 입력해주세요.",
      });
    }

    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const user = await User.findById(memberId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "사용자를 찾을 수 없습니다." });
      }

      // 기존 이미지 삭제 (새 이미지가 있을 경우)
      if (user.profilePicture && profilePicture) {
        const existingImagePath = path.join(
          __dirname,
          "..",
          user.profilePicture
        );
        try {
          if (fs.existsSync(existingImagePath)) {
            fs.unlinkSync(existingImagePath);
          }
        } catch (err) {
          console.warn("기존 이미지 삭제 실패:", err.message);
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        memberId,
        {
          profilePicture: profilePicture || user.profilePicture,
          nickname: nickname || user.nickname,
          birth: birth ? new Date(birth) : user.birth,
          updatedAt: new Date(),
        },
        { new: true }
      );

      res.json({
        success: true,
        message: "프로필이 업데이트되었습니다.",
        data: updatedUser,
      });
    } catch (err) {
      console.error("프로필 수정 실패:", err);
      res.status(500).json({
        success: false,
        message: "프로필 수정 실패",
        error: err.message,
      });
    }
  }
);

module.exports = router;
