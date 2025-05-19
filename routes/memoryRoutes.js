const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Memory = require("../models/memory");
const authenticate = require("../middleware/authMiddleware");

// 📁 업로드 경로 존재하지 않으면 생성
const uploadDir = "uploads/memories";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 📷 이미지 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/**
 * 📌 추억 생성 (이미지 포함)
 * 프론트에서 multipart/form-data로 전송해야 함
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const memories = await Memory.find({ coupleId: req.coupleId }).sort({
      createdAt: -1,
    });
    res.status(200).json(memories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "메모리 조회 실패" });
  }
});
router.post("/", authenticate, upload.array("images", 5), async (req, res) => {
  try {
    const { title, content, createdAt, position, rotation } = req.body;

    const imageUrls = req.files.map(
      (file) => `/uploads/memories/${file.filename}`
    );

    const memory = new Memory({
      memberId: req.memberId,
      coupleId: req.coupleId,
      title,
      content,
      createdAt,
      position: JSON.parse(position),
      rotation: Number(rotation),
      imageUrl: imageUrls.length > 0 ? imageUrls : null,
    });

    await memory.save();

    res.status(201).json({
      success: true,
      message: "추억이 저장되었습니다.",
      data: memory,
    });
  } catch (err) {
    console.error("Memory 저장 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

/**
 * 특정 사용자의 모든 추억 조회
 */
router.get("/:memberId", async (req, res) => {
  try {
    const memories = await Memory.find({ memberId: req.params.memberId });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: "Failed to get memories" });
  }
});

/**
 * 추억의 위치 및 회전 업데이트
 */
router.patch("/:id", async (req, res) => {
  try {
    const { position, rotation } = req.body;
    const updatedMemory = await Memory.findByIdAndUpdate(
      req.params.id,
      { position, rotation },
      { new: true }
    );
    res.json(updatedMemory);
  } catch (err) {
    res.status(500).json({ error: "Failed to update memory" });
  }
});

/**
 * 추억 삭제
 */
router.delete("/:id", async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    // 이미지 파일도 같이 삭제 (선택)
    if (memory.imageUrl) {
      const filePath = path.join(__dirname, "..", memory.imageUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.warn("이미지 파일 삭제 실패:", err);
      });
    }

    await Memory.findByIdAndDelete(req.params.id);
    res.json({ message: "Memory deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete memory" });
  }
});
router.get("/detail/:id", async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: "Memory not found" });
    }
    res.json(memory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get memory detail" });
  }
});
router.put(
  "/:id",
  authenticate,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { title, content, createdAt, position, rotation, removeImages } =
        req.body;
      // removeImages: 삭제할 이미지 URL 배열 (JSON 문자열로 보내서 JSON.parse 필요)

      const memory = await Memory.findById(req.params.id);
      if (!memory) {
        return res.status(404).json({ error: "Memory not found" });
      }

      // 기존 이미지 배열
      let existingImages = memory.imageUrl || [];

      // 삭제할 이미지가 있으면 제거
      if (removeImages) {
        // removeImages가 문자열일 경우 파싱
        let imagesToRemove = [];
        if (typeof removeImages === "string") {
          imagesToRemove = JSON.parse(removeImages);
        } else {
          imagesToRemove = removeImages;
        }

        // 기존 이미지 배열에서 삭제할 이미지 제거
        existingImages = existingImages.filter(
          (img) => !imagesToRemove.includes(img)
        );

        // 실제 이미지 파일도 삭제 (optional)
        imagesToRemove.forEach((imgUrl) => {
          const filePath = path.join(__dirname, "..", imgUrl);
          fs.unlink(filePath, (err) => {
            if (err) console.warn("이미지 파일 삭제 실패:", err);
          });
        });
      }

      // 새로 업로드된 이미지 추가
      if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map(
          (file) => `/uploads/memories/${file.filename}`
        );
        existingImages = existingImages.concat(newImageUrls);
      }

      // 필드 업데이트
      if (title !== undefined) memory.title = title;
      if (content !== undefined) memory.content = content;
      if (createdAt !== undefined) memory.createdAt = createdAt;
      if (position !== undefined) memory.position = JSON.parse(position);
      if (rotation !== undefined) memory.rotation = Number(rotation);

      memory.imageUrl = existingImages;

      await memory.save();

      res.json({
        success: true,
        message: "추억이 성공적으로 수정되었습니다.",
        data: memory,
      });
    } catch (err) {
      console.error("추억 수정 오류:", err);
      res.status(500).json({ success: false, message: "서버 오류" });
    }
  }
);
router.post("/upload", authenticate, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "이미지가 첨부되지 않았습니다." });
    }

    const imageUrl = `/uploads/memories/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "이미지 업로드 성공",
      imageUrl,
    });
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
