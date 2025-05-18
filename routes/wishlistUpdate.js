const express = require("express");
const {
  updateWishlistItem,
  getWishlist,
} = require("../controllers/wishlistUpdateController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/item", auth, getWishlist);
router.put("/item/update", auth, updateWishlistItem);

module.exports = router;
