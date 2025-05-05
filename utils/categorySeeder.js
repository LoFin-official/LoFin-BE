const { Category } = require("../models/wishlistmodels");

// 카테고리 초기 데이터 설정을 위한 함수
const seedCategories = async () => {
  try {
    // 기존 카테고리 개수 확인
    const count = await Category.countDocuments();

    // 이미 카테고리가 있으면 초기화 건너뛰기
    if (count > 0) {
      console.log("카테고리가 이미 초기화되어 있습니다.");
      return;
    }

    // 수정된 카테고리 데이터 기반으로 초기 데이터 설정
    const categories = [
      {
        name: "패션&악세서리",
        subcategories: ["패션", "악세서리"],
        subDetails: {
          패션: [
            "모자",
            "자켓",
            "상의",
            "하의",
            "신발",
            "가방",
            "목도리",
            "장갑",
            "귀마개",
          ],
          악세서리: [
            "반지",
            "목걸이",
            "팔찌",
            "귀걸이",
            "시계",
            "키링",
            "브로치",
            "지갑",
            "헤어핀",
          ],
        },
      },
      {
        name: "뷰티&향기",
        subcategories: ["뷰티", "향기"],
        subDetails: {
          뷰티: [
            "립 메이크업",
            "눈 메이크업",
            "쿠션",
            "기초 케어",
            "집중 케어",
            "치크 & 도구",
            "썬크림",
            "고데기",
          ],
          향기: ["향수", "디퓨저", "미스트", "캔들", "입욕제"],
        },
      },
      {
        name: "정성",
        subcategories: ["정성"],
        subDetails: {
          정성: [
            "손편지",
            "포트북",
            "무드등",
            "꽃다발",
            "커플 액자",
            "수제 디저트",
          ],
        },
      },
      {
        name: "전자기기",
        subcategories: ["전자기기"],
        subDetails: {
          전자기기: ["스마트워치", "무선 이어폰", "폴라로이드", "포토 프린터"],
        },
      },
      {
        name: "기타",
        subcategories: ["기타"],
        subDetails: {
          기타: ["기타"],
        },
      },
    ];

    // 카테고리 데이터 삽입 (upsert 방식 사용)
    for (const category of categories) {
      const existingCategory = await Category.findOne({ name: category.name });
      if (!existingCategory) {
        await Category.create(category);
        console.log(`${category.name} 카테고리가 추가되었습니다.`);
      } else {
        console.log(`${category.name} 카테고리는 이미 존재합니다.`);
      }
    }
    console.log("카테고리 초기화 완료");
  } catch (err) {
    console.error("카테고리 초기화 실패:", err);
  }
};

module.exports = seedCategories;
