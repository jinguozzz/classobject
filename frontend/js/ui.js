// ui.js —— game.js 必须在其前面加载！

window.addEventListener('DOMContentLoaded', function() {
  window.currentUser = null;

  // ====== DOM获取 ======
  const loginDiv = document.getElementById('loginDiv');
  const planeSelectDiv = document.getElementById('planeSelectDiv');
  const gameDiv = document.getElementById('gameDiv');
  const loginMsg = document.getElementById('loginMsg');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rankBtn = document.getElementById('rankBtn');
  const rankBoard = document.getElementById('rankBoard');
  const reselectPlaneBtn = document.getElementById('reselectPlaneBtn');
  const buySkillBtn = document.getElementById('buySkillBtn');
  const scoreBoard = document.getElementById('scoreBoard');
  const coinBoard = document.getElementById('coinBoard');
  const skillCountBoard = document.getElementById('skillCountBoard');
  const confirmPlaneBtn = document.getElementById('confirmPlaneBtn');

  // 工具函数
  function updateCoinBoard() {
    coinBoard.innerText = `金币：${window.currentUser ? window.currentUser.coins : 0}`;
  }
  
  function updateSkillCountBoard() {
    let skillCount = 0;
    if (window.hero && typeof window.hero.skillCount === 'number') {
      skillCount = window.hero.skillCount;
    }
    skillCountBoard.innerText = `技能次数：${skillCount}`;
  }

  // 登录注册
  document.getElementById('registerBtn').onclick = function() {
    playSound(SOUNDS.button);
    fetch('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
    }).then(res => res.json()).then(data => loginMsg.innerText = data.msg);
  };

  document.getElementById('loginBtn').onclick = function() {
    playSound(SOUNDS.button);
    fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
    }).then(res => res.json()).then(data => {
      if (data.user) {
        loginDiv.style.display = 'none';
        planeSelectDiv.style.display = 'block';
        window.currentUser = data.user;
        scoreBoard.innerText = `最高分：${data.user.highScore}`;
        updateCoinBoard();
        updateSkillCountBoard();
        reselectPlaneBtn.style.display = 'none';
        buySkillBtn.style.display = 'inline-block';
        playSound(SOUNDS.game_music);
      } else {
        loginMsg.innerText = data.msg;
      }
    });
  };

  buySkillBtn.onclick = function() {
    playSound(SOUNDS.button);
    if (window.currentUser && window.currentUser.coins >= 100) {
      if (!window.hero) return alert("英雄对象未初始化！");
      window.hero.skillCount = (window.hero.skillCount || 0) + 1;
      updateSkillCountBoard();
      window.currentUser.coins -= 100;
      updateCoinBoard();
      alert('购买成功，获得1次技能使用机会！');
      fetch('/api/buy-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: window.currentUser.username, cost: 100 })
      }).then(res => res.json()).then(data => {
        if (data.success) {
          window.currentUser.coins = data.leftCoins;
          updateCoinBoard();
          playSound(SOUNDS.upgrade);
        } else {
          window.hero.skillCount = Math.max((window.hero.skillCount || 1) - 1, 0);
          alert(data.msg || '购买失败');
          updateSkillCountBoard();
          updateCoinBoard();
        }
      });
    } else {
      alert('金币不足，无法购买！');
    }
  };

  // 飞机选择
  function selectPlane(idx) {
    playSound(SOUNDS.button);
    for (let i = 0; i < 5; ++i) {
      document.getElementById('planeImg' + i).classList.remove('selected');
    }
    document.getElementById('planeImg' + idx).classList.add('selected');
    window.selectedPlaneIndex = idx;
    confirmPlaneBtn.disabled = false;
  }
  for (let i = 0; i < 5; ++i) {
    document.getElementById('planeImg' + i).onclick = () => selectPlane(i);
  }

  confirmPlaneBtn.onclick = function() {
    playSound(SOUNDS.button);
    if (window.selectedPlaneIndex !== null) {
      planeSelectDiv.style.display = 'none';
      gameDiv.style.display = 'block';
      const profiles = window.HERO_PLANE_PROFILES;
      const idx = typeof window.selectedPlaneIndex === 'number' ? window.selectedPlaneIndex : 0;
      const profile =
        Array.isArray(profiles) && profiles[idx]
          ? profiles[idx]
          : (Array.isArray(profiles) ? profiles[0] : null);

      if (!profile || !window.hero) {
        alert('飞机属性配置或英雄对象未加载！');
        return;
      }

      window.hero.hp = profile.hp;
      window.hero.speed = profile.speed;
      window.hero.bulletType = profile.bulletType;
      window.hero.bulletPower = profile.bulletPower;
      window.hero.fireRate = profile.fireRate;
      window.hero.alive = true;
      window.hero.bombs = 0;
      window.hero.invincible = 0;
      window.hero.fire = 0;
      window.hero.skillCount = window.hero.skillCount || 0;
      scoreBoard.innerText = `最高分：${window.currentUser && window.currentUser.highScore || 0}`;
      updateSkillCountBoard();
      reselectPlaneBtn.style.display = 'block';
    }
  };

  // 排行榜
  rankBtn.onclick = function () {
    playSound(SOUNDS.button);
    fetch('/api/rank').then(res => res.json()).then(arr => {
      rankBoard.innerHTML = "<b>排行榜</b><br>" +
        arr.map((u, i) => `${i + 1}. ${u.username}: ${u.highScore} 分（金:${u.coins}）`).join('<br>');
      rankBoard.style.display = 'block';
      setTimeout(() => rankBoard.style.display = 'none', 5000);
    });
  };

  // 重新选飞机
  reselectPlaneBtn.onclick = function() {
    playSound(SOUNDS.button);
    gameDiv.style.display = 'none';
    rankBoard.style.display = 'none';
    reselectPlaneBtn.style.display = 'none';
    planeSelectDiv.style.display = 'block';
    window.selectedPlaneIndex = null;
    for (let i = 0; i < 5; ++i) {
      document.getElementById('planeImg' + i).classList.remove('selected');
    }
    confirmPlaneBtn.disabled = true;
  };

  // 页面初始化
  loginDiv.style.display = '';
  planeSelectDiv.style.display = 'none';
  gameDiv.style.display = 'none';
  updateCoinBoard();
  updateSkillCountBoard();
});