const express = require('express');
const router = express.Router();
const { loadUsers, saveUsers } = require('../models/users');

// 技能购买
router.post('/buy-skill', (req, res) => {
  const { username, cost } = req.body;
  let users = loadUsers();
  let user = users.find(u => u.username === username);
  if (!user) return res.json({ success: false, msg: '用户不存在' });
  if (typeof user.coins !== "number") user.coins = 300;
  if (user.coins < cost) return res.json({ success: false, msg: '金币不足' });
  user.coins -= cost;
  saveUsers(users);
  res.json({ success: true, leftCoins: user.coins });
});

module.exports = router;