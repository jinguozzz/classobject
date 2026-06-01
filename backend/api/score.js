const express = require('express');
const router = express.Router();
const { loadUsers, saveUsers } = require('../models/users');

// 保存分数
router.post('/score', (req, res) => {
  const { username, score } = req.body;
  let users = loadUsers();
  let user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ msg: '用户不存在' });
  if (score > user.highScore) user.highScore = score;
  saveUsers(users);
  res.json({ msg: '成绩已保存', highScore: user.highScore });
});

// 排行榜
router.get('/rank', (req, res) => {
  let users = loadUsers();
  users.sort((a, b) => b.highScore - a.highScore);
  res.json(users.slice(0, 10).map(u => ({
    username: u.username, highScore: u.highScore, coins: u.coins || 0
  })));
});

module.exports = router;