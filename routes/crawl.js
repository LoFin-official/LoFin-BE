const express = require("express");
const router = express.Router();
const scrapeGmarket = require("../crawler/coupangScraper");

router.get("/gmarket", async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "검색어(keyword)를 입력하세요." });
  }

  try {
    const products = await scrapeGmarket(keyword);
    res.json({ keyword, products });
  } catch (err) {
    res.status(500).json({ error: "크롤링 실패" });
  }
});

module.exports = router;
