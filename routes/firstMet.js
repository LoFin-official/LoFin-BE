const express = require("express");
const router = express.Router();
const {
  setFirstMetDate,
  calculateDaysSinceFirstMet,
  updateFirstMetDate,
  getFirstMetDate, // 추가
} = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

router.post("/firstmet", auth, setFirstMetDate);
router.put("/update", auth, updateFirstMetDate);
router.get("/days-since-first-met", auth, calculateDaysSinceFirstMet);

// 새로 추가하는 경로
router.get("/firstmet", auth, getFirstMetDate);

module.exports = router;
