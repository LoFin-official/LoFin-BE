cconst express = require('express');
const router = express.Router();
const Question = require('../models/question');

// POST: 사용자 질문 저장
router.post('/', async (req, res) => {
  try {
    const { content, memberId } = req.body;

    // content가 없으면 에러 처리
    if (!content) {
      return res.status(400).json({ error: 'content 필드는 필수입니다.' });
    }

    const newQuestion = new Question({
      title: content,   // title과 content를 동일하게 저장
      content: content,
      memberId
    });

    await newQuestion.save();
    res.status(201).json({ message: '질문이 저장되었습니다.', question: newQuestion });
  } catch (err) {
    res.status(500).json({ error: '질문 저장 중 오류 발생', details: err.message });
  }
});

// GET: 랜덤 질문 하나 가져오기
router.get('/random', async (req, res) => {
  try {
    // 시스템 질문 개수만 세기
    const count = await Question.countDocuments({ memberId: "system" });
    if (count === 0) {
      return res.status(404).json({ message: '시스템 질문이 없습니다.' });
    }

    // 랜덤 인덱스 생성
    const random = Math.floor(Math.random() * count);

    // memberId가 system인 질문 중 랜덤으로 하나 가져오기
    const question = await Question.findOne({ memberId: "system" }).skip(random);

    if (!question) {
      return res.status(404).json({ message: '질문을 찾을 수 없습니다.' });
    }

    res.json(question);
  } catch (err) {
    res.status(500).json({ error: '랜덤 질문 가져오는 중 오류 발생', details: err.message });
  }
});


module.exports = router;
