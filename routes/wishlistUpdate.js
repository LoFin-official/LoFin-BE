// routes/wishlist.js

const express = require("express");
const {
  updateWishlistItem,
} = require("../controllers/wishlistUpdateController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// 위시리스트 항목 수정 (PUT)
router.put("/item/update", auth, updateWishlistItem);

module.exports = router;
