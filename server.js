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

// 라우트 설정
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/profileUpdate", profileUpdateRoutes); // 프로필 수정 라우터 경로 추가
app.use("/wishlist", wishlistRoutes); // 위시리스트 라우터 경로 추가
app.use("/wishlistUpdate", wishlistUpdateRoutes); // 위시리스트 수정 라우터 경로 추가
app.use("/coupleLink", coupleRouter); // 커플 연결 라우터 경로 추가
app.use("/firstMet", firstMetRouter); // 처음 만난 날짜 라우터 경로 추가
app.use("/password", passwordRouter);

const PORT = process.env.PORT || 3000; // 환경변수에서 PORT를 사용하고 없으면 3000 사용
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중`);
});
