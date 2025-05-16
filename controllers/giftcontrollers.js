const Anniversary = require("../models/anniversarymodels");
const Gift = require("../models/giftItem");

// 가장 가까운 기념일 title 계산
function getNearestAnniversaryTitle(anniversaries) {
  const today = new Date();

  const upcoming = anniversaries
    .map((anniv) => ({
      ...anniv._doc,
      days: Math.ceil((new Date(anniv.date) - today) / (1000 * 60 * 60 * 24)),
    }))
    .filter((a) => a.days >= 0)
    .sort((a, b) => a.days - b.days);

  return upcoming[0]?.title || null;
}

// 키워드로 상품 필터링
function filterProductsByNearestKeyword(products, keyword) {
  if (!keyword) return [];
  return products.filter((item) => item.keywords.includes(keyword));
}

// 추천 API 로직
exports.recommendGifts = async (req, res) => {
  try {
    const { memberId } = req.body;

    // ownerId로 바꾸셨다면 여기서도 바꾸세요
    const anniversaries = await Anniversary.find({ ownerId: memberId });
    const nearestTitle = getNearestAnniversaryTitle(anniversaries);

    const allProducts = await Gift.find();

    // 먼저 title과 일치하는 키워드로 필터링
    let recommended = filterProductsByNearestKeyword(allProducts, nearestTitle);

    // 만약 일치하는 키워드가 없으면, 기본 '기념일' 키워드 상품으로 대체
    if (recommended.length === 0) {
      recommended = filterProductsByNearestKeyword(allProducts, "기념일");
    }

    res.json({
      success: true,
      title: nearestTitle,
      data: recommended,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "추천 실패" });
  }
};
