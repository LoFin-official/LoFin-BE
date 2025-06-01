const dayjs = require("dayjs");
const scrapeGmarket = require("./coupangScraper"); // 또는 gmarketScraper로 수정

// 주요 기념일 기준 날짜 수
const ddayTargets = [
  { days: 100, keyword: "100일" },
  { days: 200, keyword: "200일" },
  { days: 300, keyword: "300일" }, // 추가
  { days: 365, keyword: "1주년" },
  { days: 730, keyword: "2주년" },
  { days: 1095, keyword: "3주년" }, // 365 * 3
  { days: 1460, keyword: "4주년" }, // 365 * 4
  { days: 1825, keyword: "5주년" }, // 365 * 5
];

// 선물 추천 로직 (크롤링 또는 DB 쿼리)
const getGiftsByKeyword = async (keyword) => {
  const searchQuery = `커플 ${keyword} 선물`; // 검색 키워드
  const results = await scrapeGmarket(searchQuery); // 크롤링 실행

  if (!results || results.length === 0) {
    return [`${keyword}에 대한 추천 결과가 없습니다.`];
  }

  // 최대 3개 추려서 리턴
  return results.slice(0, 3);
};

const recommendGiftByFirstMet = async (firstMetDate) => {
  const today = dayjs();
  const firstDate = dayjs(firstMetDate);

  const diffDays = today.diff(firstDate, "day");

  // 다가올 D-day 찾기
  for (const { days, keyword } of ddayTargets) {
    if (diffDays < days) {
      const giftList = await getGiftsByKeyword(keyword);
      return {
        dday: `D+${days}`,
        keyword,
        giftList,
      };
    }
  }

  return { message: "다가오는 D-day 기념일이 없습니다." };
};

module.exports = recommendGiftByFirstMet;
