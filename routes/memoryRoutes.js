const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Memory = require('../models/memory');

// 메모리 생성
router.post('/', async (req, res) => {
  try {
    const { memberId, title, content, imageUrl, position, rotation } = req.body;

    // ObjectId로 변환
    const memory = new Memory({
      memberId: new mongoose.Types.ObjectId(memberId),
      title,
      content,
      imageUrl,
      position,
      rotation
    });

    await memory.save();
    res.status(201).json(memory);
  } catch (err) {
    res.status(500).json({ error: 'Memory creation failed', details: err.message });
  }
});

// 특정 사용자의 모든 추억 조회
router.get('/:memberId', async (req, res) => {
  try {
    const memories = await Memory.find({ memberId: req.params.memberId });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get memories' });
  }
});

// 추억의 위치 및 회전 업데이트
router.patch('/:id', async (req, res) => {
  try {
    const { position, rotation } = req.body;
    const updatedMemory = await Memory.findByIdAndUpdate(
      req.params.id,
      { position, rotation },
      { new: true }
    );
    res.json(updatedMemory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// 추억 삭제
router.delete('/:id', async (req, res) => {
  try {
    await Memory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Memory deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

module.exports = router;
