require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

// 라우터들
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const profileUpdateRoutes = require("./routes/profileUpdate");
const wishlistRoutes = require("./routes/wishlist");
const wishlistUpdateRoutes = require("./routes/wishlistUpdate");
const coupleRouter = require("./routes/coupleLink");
const firstMetRouter = require("./routes/firstMet");
const passwordRouter = require("./routes/password");
const stickerRouter = require("./routes/emoticon");
const anniversaryRoutes = require("./routes/anniversary");
const recommendRoutes = require("./routes/recommend");
const giftRouter = require("./routes/gift");
const memoryRoutes = require("./routes/memoryRoutes");
const questionRoutes = require("./routes/questionRoutes");
const coupleProfileRoutes = require("./routes/coupleprofile");
const answerRoutes = require("./routes/answer");
const crawlRouter = require("./routes/crawl");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.PRIVATE_IP], //.env에 본인 IP입력
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  })
);

const memoriesDir = path.join(__dirname, "uploads", "memories");
if (!fs.existsSync(memoriesDir)) {
  fs.mkdirSync(memoriesDir, { recursive: true });
  console.log("'uploads/memories' 폴더 생성 완료");
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 라우터 연결
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/profileUpdate", profileUpdateRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/wishlistUpdate", wishlistUpdateRoutes);
app.use("/coupleLink", coupleRouter);
app.use("/firstMet", firstMetRouter);
app.use("/password", passwordRouter);
app.use("/emoticon", stickerRouter);
app.use("/anniversary", anniversaryRoutes);
app.use("/recommend", recommendRoutes);
app.use("/gift", giftRouter);
app.use("/memory", memoryRoutes);
app.use("/question", questionRoutes);
app.use("/coupleprofile", coupleProfileRoutes);
app.use("/answer", answerRoutes);
app.use("/crawl", crawlRouter);
app.use("/message", messageRoutes);

module.exports = app;
