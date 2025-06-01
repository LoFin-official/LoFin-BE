const mongoose = require("mongoose");
const cron = require("node-cron");
const httpServer = require("./chat/chatServer");
const seedCategories = require("./utils/categorySeeder");
const Anniversary = require("./models/anniversarymodels");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB 연결 성공!");
    seedCategories();
  })
  .catch((err) => console.error("MongoDB 연결 실패", err));

const getDaysUntilAnniversary = (anniversaryDate) => {
  const currentDate = new Date();
  const targetDate = new Date(anniversaryDate);
  const timeDiff = targetDate - currentDate;
  const dayDiff = Math.abs(Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
  return dayDiff;
};

cron.schedule("0 0 * * *", async () => {
  try {
    const anniversaries = await Anniversary.find();
    for (const anniversary of anniversaries) {
      const updatedDays = getDaysUntilAnniversary(anniversary.date);
      await Anniversary.updateOne({ _id: anniversary._id }, { $set: { days: updatedDays } });
      if (new Date(anniversary.date) < new Date()) {
        await Anniversary.deleteOne({ _id: anniversary._id });
        console.log(`기념일 "${anniversary.title}"가 삭제되었습니다.`);
      }
    }
    console.log("기념일의 days 값이 갱신되었습니다.");
  } catch (err) {
    console.error("기념일 갱신 실패:", err);
  }
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`서버 및 WebSocket이 ${PORT}번 포트에서 실행 중`);
});
