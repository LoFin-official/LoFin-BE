const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware"); // 인증 미들웨어 추가
const router = express.Router();

// multer 설정 (업로드된 파일을 'uploads' 폴더에 저장)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 파일 저장 위치
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 고유한 파일 이름 생성
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한 (5MB)
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용 (jpg, jpeg, png, gif)
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

// 프로필 사진, 닉네임, 생년월일을 업데이트하는 API
router.put(
  "/upload",
  authenticate,
  upload.single("profilePicture"),
  async (req, res) => {
    const { nickname, birth } = req.body;
    const memberId = req.memberId; // JWT에서 가져온 사용자 ID

    // 생년월일 형식 확인 (yyyy-mm-dd)
    const birthdateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (birth && !birth.match(birthdateFormat)) {
      return res.status(400).json({
        success: false,
        message:
          "생년월일 형식이 잘못되었습니다. yyyy-mm-dd 형식으로 입력해주세요.",
      });
    }

    // 프로필 사진 경로 (파일이 업로드되면 저장된 경로를 사용)
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const updatedUser = await User.findByIdAndUpdate(
        memberId,
        {
          nickname,
          birth: birth ? new Date(birth) : null,
          profilePicture: profilePicture,
          updatedAt: new Date(), // ✅ 수동으로 updatedAt 갱신
        },
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "사용자를 찾을 수 없습니다." });
      }

      res.json({
        success: true,
        message: "프로필이 업데이트되었습니다.",
        data: updatedUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "프로필 업데이트 실패",
        error: err.message,
      });
    }
  }
);

module.exports = router;
