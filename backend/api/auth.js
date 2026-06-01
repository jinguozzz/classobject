const express = require('express');
const router = express.Router();
const { loadUsers, saveUsers } = require('../models/users');
// 注册接口
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: '用户名和密码不能为空' });
  let users = loadUsers();
  if (users.find(u => u.username === username)) return res.status(400).json({ msg: '用户已存在' });
  users.push({ username, password, highScore: 0, coins: 300 });
  saveUsers(users);
  res.json({ msg: '注册成功' });
});
// 登录接口
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  let users = loadUsers();
  let user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ msg: '用户名或密码错误' });
  if (typeof user.coins !== "number") {
    user.coins = 300;
    saveUsers(users);
  }
  res.json({ 
    msg: '登录成功', 
    user: { username: user.username, highScore: user.highScore, coins: user.coins } 
  });
});

module.exports = router;