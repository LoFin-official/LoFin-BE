const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Memory = require("../models/memory");
const authenticate = require("../middleware/authMiddleware");

// 업로드 경로 존재하지 않으면 생성
const uploadDir = "uploads/memories";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 이미지 저장 설정
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
 *  추억 생성 (이미지 포함)
 * 프론트에서 multipart/form-data로 전송해야 함
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const memories = await Memory.find({ coupleId: req.coupleId }).sort({
      memoryDate: -1, // createdAt 대신 memoryDate 기준 정렬 권장
    });
    res.status(200).json(memories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "메모리 조회 실패" });
  }
});

router.post("/", authenticate, upload.array("images", 5), async (req, res) => {
  try {
    const {
      title,
      content,
      memoryDate,
      position,
      // rotation은 이제 req.body에서 직접 가져오지 않고 기본값 0을 사용합니다.
      styleType,
    } = req.body;

    const imageUrls = req.files.map(
      (file) => `/uploads/memories/${file.filename}`
    );

    // position이 문자열로 올 경우를 대비하여 JSON.parse를 적용
    let parsedPosition;
    try {
      parsedPosition = position ? JSON.parse(position) : { x: 0, y: 0 }; // position이 없을 경우 기본값 설정
    } catch (e) {
      console.error("Invalid position JSON:", position, e);
      return res
        .status(400)
        .json({ success: false, message: "잘못된 position 형식입니다." });
    }

    const memory = new Memory({
      memberId: req.memberId,
      coupleId: req.coupleId,
      title,
      content,
      memoryDate: new Date(memoryDate),
      position: parsedPosition,
      rotation: 0, //
      styleType,
      imageUrl: imageUrls.length > 0 ? imageUrls : [],
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
 * 추억 삭제
 */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const memoryId = req.params.id;
    const coupleId = req.coupleId; // authMiddleware에서 req.coupleId에 저장됨

    const memory = await Memory.findById(memoryId);
    if (!memory) {
      return res.status(404).json({ message: "삭제할 메모리가 없습니다." });
    }

    // 삭제 권한 확인: 메모리의 coupleId와 요청한 사용자의 coupleId가 같은지 체크
    if (memory.coupleId !== coupleId) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    await Memory.findByIdAndDelete(memoryId);

    return res.status(200).json({
      success: true,
      message: "메모리가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("메모리 삭제 중 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
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
      const {
        title,
        content,
        memoryDate,
        position,
        rotation,
        removeImages,
        styleType, // 클라이언트에서 보내는 styleType
      } = req.body;

      const memory = await Memory.findById(req.params.id);
      if (!memory) {
        return res.status(404).json({ error: "Memory not found" });
      }

      // 기존 이미지 처리
      let existingImages = memory.imageUrl || [];

      // 삭제할 이미지가 있으면 삭제
      if (removeImages) {
        let imagesToRemove = [];
        if (typeof removeImages === "string") {
          imagesToRemove = JSON.parse(removeImages);
        } else {
          imagesToRemove = removeImages;
        }

        existingImages = existingImages.filter(
          (img) => !imagesToRemove.includes(img)
        );

        imagesToRemove.forEach((imgUrl) => {
          const filePath = path.join(__dirname, "..", imgUrl);
          fs.unlink(filePath, (err) => {
            if (err) console.warn("이미지 파일 삭제 실패:", err);
          });
        });
      }

      // 새 이미지 추가
      if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map(
          (file) => `/uploads/memories/${file.filename}`
        );
        existingImages = existingImages.concat(newImageUrls);
      }

      // 필드별 업데이트
      if (title !== undefined) memory.title = title;
      if (content !== undefined) memory.content = content;
      if (memoryDate !== undefined) memory.memoryDate = new Date(memoryDate);
      if (position !== undefined) memory.position = JSON.parse(position);
      if (rotation !== undefined) memory.rotation = Number(rotation);

      // styleType도 있으면 업데이트
      if (styleType !== undefined) {
        memory.styleType = styleType;
      }

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
router.patch("/location/:id", async (req, res) => {
  try {
    const { position, rotation } = req.body; // position과 rotation 모두 받음

    const updateFields = {};
    if (position) {
      // position이 {x, y} 객체 형태인지 확인
      if (typeof position.x === "number" && typeof position.y === "number") {
        updateFields.position = position;
      } else {
        return res.status(400).json({
          error:
            "유효하지 않은 position 형식입니다. {x: number, y: number} 형태여야 합니다.",
        });
      }
    }
    if (rotation !== undefined && typeof rotation === "number") {
      // rotation이 넘어왔고 숫자인 경우에만 업데이트
      updateFields.rotation = rotation;
    }

    // 업데이트할 필드가 없는 경우
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        error: "업데이트할 데이터가 없습니다 (position 또는 rotation 필요).",
      });
    }

    const updatedMemory = await Memory.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields }, // $set 연산자를 사용하여 지정된 필드만 업데이트
      { new: true, runValidators: true } // new: true는 업데이트된 문서를 반환, runValidators: true는 스키마 유효성 검사 실행
    );

    if (!updatedMemory) {
      return res.status(404).json({ error: "메모리를 찾을 수 없습니다." });
    }
    res.status(200).json({
      success: true,
      message: "메모리 업데이트 성공",
      memory: updatedMemory,
    });
  } catch (error) {
    console.error("메모리 업데이트 오류:", error); // 서버 로그에 상세 에러 출력
    res.status(500).json({ error: "서버 오류", details: error.message }); // 클라이언트에 에러 상세 정보 일부 전달
  }
});
module.exports = router;
