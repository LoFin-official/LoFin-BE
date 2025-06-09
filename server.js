const mongoose = require('mongoose');
const cron = require('node-cron');
const httpServer = require('./chat/chatserver');
const seedCategories = require('./utils/categorySeeder');
const Anniversary = require('./models/anniversarymodels');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
    seedCategories();
  })
  .catch((err) => console.error('❌ MongoDB 연결 실패', err));

cron.schedule('0 0 * * *', async () => {
  const anniversaries = await Anniversary.find();
  for (const ann of anniversaries) {
    const days = Math.abs(Math.floor((new Date(ann.date) - new Date()) / (1000 * 60 * 60 * 24)));
    if (new Date(ann.date) < new Date()) {
      await Anniversary.deleteOne({ _id: ann._id });
    } else {
      await Anniversary.updateOne({ _id: ann._id }, { days });
    }
  }
  console.log('🔁 기념일 days 갱신 완료');
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 서버 및 WebSocket이 ${PORT}번 포트에서 실행 중`);
});
