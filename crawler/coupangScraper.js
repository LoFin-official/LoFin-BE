const fetch = require("node-fetch");
const cheerio = require("cheerio");

async function scrapeGmarket(keyword) {
  const url = `https://browse.gmarket.co.kr/search?keyword=${encodeURIComponent(
    keyword
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:110.0) Gecko/20100101 Firefox/110.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        Referer: "https://browse.gmarket.co.kr/",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 🔍 상품명 셀렉터 확인 필요 (첫 번째 상품만 추출)
    const productName = $(".box__item-title span.text__item")
      .first()
      .text()
      .trim();

    return productName ? [productName] : [];
  } catch (error) {
    console.error("G마켓 fetch 크롤링 실패:", error.message);
    return [];
  }
}

module.exports = scrapeGmarket;
