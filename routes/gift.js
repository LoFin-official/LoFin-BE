const express = require("express");
const router = express.Router();
const { recommendGifts } = require("../controllers/giftcontrollers");

router.post("/recommend-products", recommendGifts);

module.exports = router;
