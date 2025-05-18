require("dotenv").config(); // .env 파일 불러오기
const mongoose = require("mongoose");
const Question = require("../LoFin-BE/models/question");
const rawQuestionsData = require("../LoFin-BE/data/myapp.questions.json");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";

async function importQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    await Question.deleteMany({ memberId: "system" });

    const questionsToInsert = rawQuestionsData.map(
      ({ _id, createdAt, updatedAt, ...rest }) => ({
        ...rest,
        memberId: "system",
        coupleId: null, // coupleId 필드가 required라면 null 허용 설정 필요
      })
    );

    await Question.insertMany(questionsToInsert);

    console.log(
      `${questionsToInsert.length}개의 질문을 데이터베이스에 삽입했습니다.`
    );
    process.exit(0);
  } catch (error) {
    console.error("데이터 삽입 중 오류:", error);
    process.exit(1);
  }
}

importQuestions();
