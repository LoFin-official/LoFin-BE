const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const profileUpdateRoutes = require("./routes/profileUpdate");
const wishlistRoutes = require("./routes/wishlist"); // 위시리스트 라우터 추가
const wishlistUpdateRoutes = require("./routes/wishlistUpdate"); // 위시리스트 수정 라우터 추가
const seedCategories = require("./utils/categorySeeder"); // 카테고리 초기화 함수 추가
const coupleRouter = require("./routes/coupleLink"); // 커플 연결 라우터 추가
const firstMetRouter = require("./routes/firstMet"); // 처음 만난 날짜 관련 라우터 추가
const passwordRouter = require("./routes/password");
const stickerRouter = require("./routes/emoticon"); // 스티커 관련 라우터 추가
const anniversaryRoutes = require("./routes/anniversary"); // 기념일 관련 라우터 추가
const cron = require("node-cron"); // node-cron 패키지 추가

dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB 연결 성공");
    // MongoDB 연결 성공 후 카테고리 초기화 실행
    seedCategories();
  })
  .catch((err) => console.error("MongoDB 연결 실패", err));

// 기념일 날짜를 기준으로 남은 일수를 계산하는 함수
const getDaysUntilAnniversary = (anniversaryDate) => {
  const currentDate = new Date(); // 현재 날짜
  const targetDate = new Date(anniversaryDate); // 기념일 날짜

  const timeDiff = targetDate - currentDate; // 날짜 차이 밀리초로 계산
  const dayDiff = Math.abs(Math.floor(timeDiff / (1000 * 60 * 60 * 24))); // 밀리초를 일수로 변환 후 절대값

  return dayDiff; // D-몇일 남았는지 절대값으로 반환
};

// 매일 자정에 기념일의 days 값을 갱신하고, 날짜가 지난 기념일을 삭제하는 크론 작업
cron.schedule("0 0 * * *", async () => {
  try {
    // 모든 기념일을 조회
    const anniversaries = await Anniversary.find();

    // 각 기념일에 대해 days 값을 갱신
    for (const anniversary of anniversaries) {
      const updatedDays = getDaysUntilAnniversary(anniversary.date); // 새로 계산된 남은 일수

      // 기념일의 days 값 갱신
      await Anniversary.updateOne(
        { _id: anniversary._id },
        { $set: { days: updatedDays } }
      );

      // 날짜가 지나면 기념일 삭제
      const currentDate = new Date();
      const anniversaryDate = new Date(anniversary.date);

      if (anniversaryDate < currentDate) {
        await Anniversary.deleteOne({ _id: anniversary._id });
        console.log(`기념일 "${anniversary.title}"가 삭제되었습니다.`);
      }
    }

    console.log("기념일의 days 값이 갱신되었습니다.");
  } catch (err) {
    console.error("기념일 갱신 실패:", err);
  }
});

// 라우트 설정
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/profileUpdate", profileUpdateRoutes); // 프로필 수정 라우터 경로 추가
app.use("/wishlist", wishlistRoutes); // 위시리스트 라우터 경로 추가
app.use("/wishlistUpdate", wishlistUpdateRoutes); // 위시리스트 수정 라우터 경로 추가
app.use("/coupleLink", coupleRouter); // 커플 연결 라우터 경로 추가
app.use("/firstMet", firstMetRouter); // 처음 만난 날짜 라우터 경로 추가
app.use("/password", passwordRouter);
app.use("/emoticon", stickerRouter); // 스티커 라우터 경로 추가
app.use("/anniversary", anniversaryRoutes); // 기념일 관련 라우터 경로 추가

const PORT = process.env.PORT || 3000; // 환경변수에서 PORT를 사용하고 없으면 3000 사용
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중`);
});
