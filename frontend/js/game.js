// ===== 飞机属性和资源常量 =====
window.HERO_PLANE_PROFILES = [
  { hp: 3, speed: 5, bulletType: 'normal', bulletPower: 1, fireRate: 20 },
  { hp: 2, speed: 7, bulletType: 'pierce', bulletPower: 2, fireRate: 18 },
  { hp: 4, speed: 4, bulletType: 'spread', bulletPower: 1, fireRate: 22 },
  { hp: 3, speed: 6, bulletType: 'laser', bulletPower: 3, fireRate: 30 },
  { hp: 5, speed: 3, bulletType: 'burst', bulletPower: 1, fireRate: 10 }
];

const SKILL_ANIM_FRAMES = [
  'assets/images/ttt01.png', 'assets/images/ttt02.png', 'assets/images/ttt03.png', 'assets/images/ttt04.png',
  'assets/images/ttt05.png', 'assets/images/ttt06.png', 'assets/images/ttt07.png', 'assets/images/ttt08.png'
];

const ASSETS = {
  backgrounds: [
    'assets/images/bg.jpg', 'assets/images/bg0.jpg', 'assets/images/bg1.jpg', 'assets/images/bg2.jpg'
  ],
  boss: 'assets/images/boss.png',
  heroPlanes: [
    'assets/images/hero.png', 'assets/images/hero03.png', 'assets/images/hero3.png', 'assets/images/hero4.png', 'assets/images/hero_b_04.png'
  ],
  bullet: 'assets/images/bullet1.png',
  heroBullets: [
    'assets/images/3.png', 'assets/images/6.png', 'assets/images/7.png', 'assets/images/8.png', 'assets/images/10.png'
  ],
  enemySmall: [
    'assets/images/enemy1.png', 'assets/images/enemy2.png'
  ],
  supplyBullet: 'assets/images/bullet_supply.png',
  supplyBomb: 'assets/images/bomb_supply.png',
  supplyHeart: 'assets/images/heart.png',
  supplySkill: 'assets/images/skill.png',
  explosion: [
    'assets/images/boom01.png', 'assets/images/boom02.png', 'assets/images/boom03.png',
    'assets/images/boom04.png', 'assets/images/boom05.png', 'assets/images/boom06.png'
  ],
  skillAnim: SKILL_ANIM_FRAMES
};

const BOSS_EXPLOSION_FRAMES = [
  'assets/images/boss_down1.png','assets/images/boss_down2.png','assets/images/boss_down3.png',
  'assets/images/boss_down4.png','assets/images/boss_down5.png','assets/images/boss_down6.png'
];

// ===== 全局变量和初始配置 =====
window.selectedPlaneIndex = null;

window.hero = {
  x: 200, y: 600, w: 80, h: 80, speed: 5, hp: 8888,
  alive: true, bombs: 0, invincible: 0, fire: 0,
  skillCount: 0
};
let currentLevel = 0;
let totalScore = 0;
let bossActive = false;
let boss = null;
let levelTipTimer = 0;
let levelPassed = false;

let keys = {};
let bullets = [], enemies = [], bosses = [], supplies = [], enemyBullets = [];
let explosions = [];
let fireCooldown = 0;
const ENEMY_MAX_ON_SCREEN = 30;
let enemySpawnTimer = 0;

// ===== 资源加载 =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let loadedImages = {
  backgrounds: [], enemySmall: [], boss: null, bullet: null,
  supplyBullet: null, supplyBomb: null, supplyHeart: null, supplySkill: null,
  explosion: [], skillAnim: []
};
let loadedHeroPlanes = [];
let loadedBossExplosion = [];
let loadedHeroBullets = [];

function loadImages(assets, callback) {
  let toLoad = 0, loadedCount = 0;
  const checkDone = () => { if (++loadedCount === toLoad) callback(); };
  toLoad += assets.backgrounds.length + assets.enemySmall.length + assets.explosion.length
    + assets.heroPlanes.length + 1 + 4; // boss+bullet+supplyBullet/supplyBomb/supplyHeart/supplySkill
  toLoad += assets.heroBullets.length;
  toLoad += assets.skillAnim.length;
  toLoad += BOSS_EXPLOSION_FRAMES.length;
  assets.backgrounds.forEach((src, i) => {
    const img = new Image(); img.src = src; img.onload = checkDone;
    loadedImages.backgrounds[i] = img;
  });
  assets.enemySmall.forEach((src, i) => {
    const img = new Image(); img.src = src; img.onload = checkDone;
    loadedImages.enemySmall[i] = img;
  });
  assets.explosion.forEach((src, i) => {
    const img = new Image(); img.src = src; img.onload = checkDone;
    loadedImages.explosion[i] = img;
  });
  assets.heroPlanes.forEach((src, i) => {
    const img = new Image(); img.src = src; img.onload = checkDone;
    loadedHeroPlanes[i] = img;
  });
  assets.heroBullets.forEach((src, i) => {
    const img = new Image(); img.src = src; img.onload = checkDone;
    loadedHeroBullets[i] = img;
  });
  ['boss', 'bullet', 'supplyBullet', 'supplyBomb', 'supplyHeart', 'supplySkill'].forEach(key => {
    const img = new Image(); img.src = assets[key]; img.onload = checkDone;
    loadedImages[key] = img;
  });
  BOSS_EXPLOSION_FRAMES.forEach((src, i) => {
    const img = new Image(); img.src = src; img.onload = checkDone;
    loadedBossExplosion[i] = img;
  });
  assets.skillAnim.forEach((src, i) => {
    const img = new Image(); img.src = src; img.onload = checkDone;
    loadedImages.skillAnim[i] = img;
  });
}


//形成动画帧并加入数组中
function createExplosion(x, y, w, h) {
  return { x, y, w, h, frame: 0, frameMax: loadedImages.explosion.length };
}

function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    const ex = explosions[i];
    if (ex.frame < ex.frameMax) {
      ctx.drawImage(loadedImages.explosion[ex.frame], ex.x, ex.y, ex.w, ex.h);
      ex.frame++;
    } else {
      explosions.splice(i, 1);
    }
  }
}
let bgY = 0;
// 滚动画面，飞行感
function drawBackground(delta = 1/60) {
  bgY += 2 * delta * 60;
  if (bgY >= canvas.height) bgY = 0;
  const bgImg = loadedImages.backgrounds[Math.min(currentLevel, loadedImages.backgrounds.length - 1)];
  ctx.drawImage(bgImg, 0, bgY - canvas.height, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, bgY, canvas.width, canvas.height);
}

function collide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ==== 英雄、飞机、键盘 ====
function drawHero() {
  if (!hero.alive) return;
  ctx.save();
  if (hero.invincible > 0 && Math.floor(hero.invincible / 5) % 2 === 0) ctx.globalAlpha = 0.5;
  let planeIdx = selectedPlaneIndex ?? 0;
  ctx.drawImage(loadedHeroPlanes[planeIdx], hero.x, hero.y, hero.w, hero.h);
  ctx.restore();
  ctx.fillStyle = 'red';
  ctx.fillRect(hero.x, hero.y - 15, hero.w, 10);
  ctx.fillStyle = 'lime';
  let maxHp = HERO_PLANE_PROFILES[selectedPlaneIndex ?? 0].hp;
  ctx.fillRect(hero.x, hero.y - 15, hero.w * (hero.hp / maxHp), 10);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(hero.x, hero.y - 15, hero.w, 10);
}
// 飞机移动
function handleKeys(delta = 1/60) {
  if (!hero.alive) return;
  const speed = hero.speed * delta * 60;
  if (keys['ArrowLeft'] && hero.x > 0) hero.x -= speed;
  if (keys['ArrowRight'] && hero.x + hero.w < canvas.width) hero.x += speed;
  if (keys['ArrowUp'] && hero.y > 0) hero.y -= speed;
  if (keys['ArrowDown'] && hero.y + hero.h < canvas.height) hero.y += speed;
}
document.addEventListener('keydown', e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
  keys[e.code] = true;
  if (e.code === 'Space') shootBullet(keys['ShiftLeft'] || keys['ShiftRight']);
  if ((e.code === 'KeyB' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') && hero.bombs > 0 && hero.alive) {
    useBomb();
  }
  if (e.code === 'KeyV' && hero.skillCount > 0 && !skillAnimPlaying) {
    hero.skillCount--;
    useSkill();
  }
});
document.addEventListener('keyup', e => keys[e.code] = false);

// ==== 子弹 ====
function shootBullet(doubleShot = false) {
  if (!hero.alive || fireCooldown > 0) return;
  playSound(SOUNDS.bullet);
  let bt = hero.bulletType || 'normal';
  let bp = hero.bulletPower || 1;
  let w = 10, h = 20, y = hero.y;
  let bulletIdx = (selectedPlaneIndex != null && selectedPlaneIndex > 0) ? selectedPlaneIndex - 1 : null;
  switch (bt) {
    case 'pierce':
      bullets.push({ x: hero.x + hero.w / 2 - 5, y, w, h, speed: 8, pierce: 3, power: bp, bulletIdx });
      fireCooldown = hero.fireRate;
      break;
    case 'spread':
      bullets.push({ x: hero.x + hero.w / 2 - 5, y, w, h, speed: 6, dx: 0, power: bp, bulletIdx });
      bullets.push({ x: hero.x + hero.w / 2 - 5, y, w, h, speed: 6, dx: -2, power: bp, bulletIdx });
      bullets.push({ x: hero.x + hero.w / 2 - 5, y, w, h, speed: 6, dx: 2, power: bp, bulletIdx });
      fireCooldown = hero.fireRate;
      break;
    case 'laser':
      bullets.push({ x: hero.x + hero.w / 2 - 2, y, w: 4, h: 40, speed: 12, laser: true, power: bp, bulletIdx });
      fireCooldown = hero.fireRate;
      break;
    case 'burst':
      for (let i = -1; i <= 1; ++i) {
        bullets.push({ x: hero.x + hero.w / 2 - 5 + i * 10, y, w, h, speed: 7 + i, power: bp, bulletIdx });
      }
      fireCooldown = hero.fireRate;
      break;
    default:
      if (doubleShot && hero.fire >= 2) {
        bullets.push({ x: hero.x + 15, y, w, h, speed: 6, power: bp });
        bullets.push({ x: hero.x + hero.w - 25, y, w, h, speed: 6, power: bp });
        fireCooldown = 15;
        hero.fire -= 2;
      } else {
        bullets.push({ x: hero.x + hero.w / 2 - 5, y, w, h, speed: 6, power: bp });
        fireCooldown = 20;
      }
      break;
  }
}
function updateBullets(delta = 1/60) {
  if (fireCooldown > 0) fireCooldown--;
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.y -= b.speed * delta * 60;
    if (b.dx) b.x += b.dx * delta * 60;
    if (b.laser) b.h = 40;
    if (b.y + b.h < 0 || b.x < 0 || b.x > canvas.width) { bullets.splice(i, 1); continue; }
    for (let j = enemies.length - 1; j >= 0; j--) {
      let e = enemies[j];
      if (!e.dead && collide(b, e)) {
        playSound(SOUNDS.enemy1_down);
        explosions.push(createExplosion(e.x, e.y, e.w, e.h));
        e.hp = (e.hp ?? 1) - (b.power ?? 1);
        if (e.hp <= 0) e.dead = true;
        totalScore += 1;
        if (b.pierce) {
          b.pierce--;
          if (b.pierce <= 0) { bullets.splice(i, 1); break; }
        } else {
          bullets.splice(i, 1); break;
        }
      }
    }
    for (let j = bosses.length - 1; j >= 0; j--) {
      let bo = bosses[j];
      if (!bo.dead && !bo.exploding && collide(b, bo)) {
        bo.hp -= (b.power ?? 1);
        if (bo.hp <= 0 && !bo.exploding) {
          bo.exploding = true;
          bo.explodeFrame = 0;
          playSound(SOUNDS.boss_down);
        }
        if (b.pierce) {
          b.pierce--;
          if (b.pierce <= 0) bullets.splice(i, 1);
        } else {
          bullets.splice(i, 1);
        }
        break;
      }
    }
    for (let j = supplies.length - 1; j >= 0; j--) {
      let s = supplies[j];
      if (collide(b, s)) {
        playSound(SOUNDS.supply);
        explosions.push(createExplosion(s.x, s.y, s.w, s.h));
        if (s.type === 'bullet') {
          hero.fire += 20;
          playSound(SOUNDS.get_bullet);
        }
        else if (s.type === 'bomb') {
          hero.bombs = (hero.bombs || 0) + 1;
          playSound(SOUNDS.get_bomb);
        }
        else if (s.type === 'heart') {
          hero.hp = Math.min(hero.hp + 1, HERO_PLANE_PROFILES[selectedPlaneIndex ?? 0].hp);
        }
        supplies.splice(j, 1);
        bullets.splice(i, 1);
        break;
      }
    }
    if (b.laser) {
      ctx.save();
      ctx.strokeStyle = '#00fffc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(b.x + 2, b.y + b.h);
      ctx.lineTo(b.x + 2, b.y);
      ctx.stroke();
      ctx.restore();
    } else if (typeof b.bulletIdx === 'number' && loadedHeroBullets[b.bulletIdx]) {
      ctx.drawImage(loadedHeroBullets[b.bulletIdx], b.x, b.y, b.w, b.h);
    } else {
      ctx.drawImage(loadedImages.bullet, b.x, b.y, b.w, b.h);
    }
  }
}

// ==== 敌人 ====
function tryAutoSpawnEnemy(delta = 1/60) {
  enemySpawnTimer += delta * 60;
  let interval = Math.max(30, 90 - currentLevel * 10);
  if (enemySpawnTimer >= interval) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }
}
function spawnEnemy() {
  if (bossActive) return;
  if (enemies.length >= ENEMY_MAX_ON_SCREEN) return;
  enemies.push({
    x: Math.random() * (canvas.width - 60),
    y: -60,
    w: 60, h: 60,
    speed: 2 + currentLevel,
    vx: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 2),
    img: loadedImages.enemySmall[currentLevel % loadedImages.enemySmall.length],
    dead: false
  });
}
function updateEnemies(delta = 1/60) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    if (e.dead) { enemies.splice(i, 1); continue; }
    e.y += e.speed * delta * 60;
    e.x += e.vx * delta * 60;
    if (e.x < 0) { e.x = 0; e.vx *= -1; }
    if (e.x + e.w > canvas.width) { e.x = canvas.width - e.w; e.vx *= -1; }
    if (e.y > canvas.height) { enemies.splice(i, 1); continue; }
    if (hero.alive && !e.dead && collide(hero, e)) {
      playSound(SOUNDS.me_down);
      explosions.push(createExplosion(e.x, e.y, e.w, e.h));
      hero.hp--;
      hero.invincible = 60;
      hero.fire = 0;
      e.dead = true;
      if (hero.hp <= 0) hero.alive = false;
    }
    ctx.drawImage(e.img, e.x, e.y, e.w, e.h);
  }
}
function enemyShoot(delta = 1/60) {
  enemies.forEach(e => {
    if (!e.dead && Math.random() < (0.01 + 0.002 * currentLevel) * delta * 60) {
      enemyBullets.push({ x: e.x + e.w / 2 - 5, y: e.y + e.h, w: 10, h: 20, speed: 4 + currentLevel });
      playSound(SOUNDS.enemy2_down);
    }
  });
}
function updateEnemyBullets(delta = 1/60) {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let b = enemyBullets[i];
    b.y += b.speed * delta * 60;
    ctx.drawImage(loadedImages.bullet, b.x, b.y, b.w, b.h);
    if (hero.x < b.x + b.w && hero.x + hero.w > b.x &&
      hero.y < b.y + b.h && hero.y + hero.h > b.y) {
      if (hero.invincible <= 0) {
        playSound(SOUNDS.me_down);
        hero.hp--;
        hero.invincible = 60;
        hero.fire = 0;
        if (hero.hp <= 0) hero.alive = false;
      }
      enemyBullets.splice(i, 1);
    } else if (b.y > canvas.height) enemyBullets.splice(i, 1);
  }
}

// ==== Boss ====
function spawnBoss() {
  bosses.push({
    x: canvas.width / 2 - 100,
    y: -200,
    w: 200, h: 150,
    speed: 1 + 0.2 * currentLevel,
    hp: 80 + 40 * currentLevel,
    dead: false,
    direction: 1,
    fireTimer: 0,
    exploding: false,
    explodeFrame: 0
  });
}
function updateBosses(delta = 1/60) {
  for (let i = bosses.length - 1; i >= 0; i--) {
    let bo = bosses[i];
    if (bo.dead) { bosses.splice(i, 1); continue; }
    if (bo.exploding) {
      let frame = Math.floor(bo.explodeFrame / 10);
      if (frame < loadedBossExplosion.length) {
        ctx.drawImage(loadedBossExplosion[frame], bo.x, bo.y, bo.w, bo.h);
        bo.explodeFrame++;
      } else {
        bo.dead = true;
        totalScore += 2;
        bossActive = false;
        levelPassed = true;
        document.getElementById('nextBtn').style.display = 'block';
      }
      continue;
    }
    if (bo.y < 50) bo.y += bo.speed * delta * 60;
    else bo.x += bo.speed * bo.direction * delta * 60;
    if (bo.x < 0) { bo.x = 0; bo.direction *= -1; }
    if (bo.x + bo.w > canvas.width) { bo.x = canvas.width - bo.w; bo.direction *= -1; }
    bo.fireTimer += delta * 60;
    if (bo.fireTimer >= Math.max(20, 60 - 10 * currentLevel)) {
      bo.fireTimer = 0;
      enemyBullets.push({
        x: bo.x + bo.w / 2 - 5,
        y: bo.y + bo.h,
        w: 10, h: 20, speed: 5 + currentLevel
      });
      playSound(SOUNDS.enemy3_flying);
    }
    if (hero.alive && collide(hero, bo)) {
      playSound(SOUNDS.me_down);
      explosions.push(createExplosion(bo.x, bo.y, bo.w, bo.h));
      hero.hp--;
      hero.invincible = 60;
      hero.fire = 0;
      bo.exploding = true;
      bo.explodeFrame = 0;
      if (hero.hp <= 0) hero.alive = false;
    }
    ctx.drawImage(loadedImages.boss, bo.x, bo.y, bo.w, bo.h);
    ctx.fillStyle = 'red';
    ctx.fillRect(bo.x, bo.y - 20, bo.w, 10);
    ctx.fillStyle = 'green';
    ctx.fillRect(bo.x, bo.y - 20, bo.w * (bo.hp / (80 + 40 * currentLevel)), 10);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(bo.x, bo.y - 20, bo.w, 10);
  }
}

// ==== 道具 ====
function spawnSupply() {
  const r = Math.random();
  let type;
  if (r < 0.4) type = 'bullet';
  else if (r < 0.8) type = 'bomb';
  else type = 'heart';
  supplies.push({
    x: Math.random() * (canvas.width - 40), y: -40,
    w: 40, h: 40, speed: 2, type
  });
  playSound(SOUNDS.supply);
}
function updateSupplies(delta = 1/60) {
  for (let i = supplies.length - 1; i >= 0; i--) {
    let s = supplies[i];
    s.y += s.speed * delta * 60;
    if (s.y > canvas.height) { supplies.splice(i, 1); continue; }
    let img;
    if (s.type === 'bullet') img = loadedImages.supplyBullet;
    else if (s.type === 'bomb') img = loadedImages.supplyBomb;
    else if (s.type === 'heart') img = loadedImages.supplyHeart;
    ctx.drawImage(img, s.x, s.y, s.w, s.h);
    if (collide(hero, s)) {
      playSound(SOUNDS.supply);
      explosions.push(createExplosion(s.x, s.y, s.w, s.h));
      if (s.type === 'bullet') {
        hero.fire += 20;
        playSound(SOUNDS.get_bullet);
      } else if (s.type === 'bomb') {
        hero.bombs = (hero.bombs || 0) + 1;
        playSound(SOUNDS.get_bomb);
      } else if (s.type === 'heart') {
        hero.hp = Math.min(hero.hp + 1, HERO_PLANE_PROFILES[selectedPlaneIndex ?? 0].hp);
      }
      supplies.splice(i, 1);
      continue;
    }
  }
}

// ==== 技能 ====
let skillAnimFrame = 0;
let skillAnimPlaying = false;
let skillAnimX = 0, skillAnimY = 0, skillAnimW = 0, skillAnimH = 0;
hero.skillActive = false;
function useSkill() {
  playSound(SOUNDS.skill);
  enemies.forEach(e => {
    if (!e.dead) {
      explosions.push(createExplosion(e.x, e.y, e.w, e.h));
      totalScore += 1;
    }
  });
  enemies = [];
  enemyBullets = [];
  hero.hp = HERO_PLANE_PROFILES[selectedPlaneIndex ?? 0].hp;
  hero.alive = true;
  hero.invincible = 120;
  skillAnimFrame = 0;
  skillAnimPlaying = true;
  hero.skillActive = true;
  skillAnimX = hero.x + hero.w / 2 - 100;
  skillAnimY = hero.y - 120;
  skillAnimW = 200;
  skillAnimH = 273;
  updateSkillCountBoard();
}
function drawSkillAnim() {
  if (skillAnimPlaying) {
    let idx = Math.floor(skillAnimFrame / 8);
    if (idx < loadedImages.skillAnim.length) {
      ctx.drawImage(
        loadedImages.skillAnim[idx],
        skillAnimX, skillAnimY, skillAnimW, skillAnimH
      );
      skillAnimFrame++;
    } else {
      skillAnimPlaying = false;
      hero.skillActive = false;
    }
  }
}

// ==== 炸弹 ====
function useBomb() {
  playSound(SOUNDS.use_bomb);
  enemies.forEach(e => {
    if (!e.dead) {
      playSound(SOUNDS.enemy1_down);
      explosions.push(createExplosion(e.x, e.y, e.w, e.h));
      totalScore += 1;
    }
  });
  bosses.forEach(b => {
    if (!b.dead && !b.exploding) {
      b.exploding = true;
      b.explodeFrame = 0;
      playSound(SOUNDS.boss_down);
    }
  });
  enemies = [];
  enemyBullets = [];
  hero.bombs--;
}

// ==== UI绘制 ====
function drawScoreAndRank() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`分数: ${totalScore}`, 10, 30);
  ctx.fillText(`火力值: ${hero.fire}`, 10, 60);
  ctx.fillText(`炸弹: ${hero.bombs || 0}`, 10, 90);
  ctx.fillText(`技能: ${hero.skillCount || 0}`, 10, 120);
}
function drawLevelTip() {
  if (levelTipTimer > 0) {
    ctx.font = '36px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText(`关卡 ${currentLevel + 1} 开始!`, canvas.width / 2, canvas.height / 2);
    levelTipTimer--;
  }
}
let gameOverShown = false;
function drawGameOver() {
  if (!hero.alive && !gameOverShown) {
    ctx.font = '48px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2);
    document.getElementById('restartBtn').style.display = 'block';
    document.getElementById('nextBtn').style.display = 'block';
    document.getElementById('reselectPlaneBtn').style.display = 'block';
    if (currentUser)
      fetch('/api/score', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, score: totalScore })
      }).then(r => r.json()).then(data => {
        document.getElementById('scoreBoard').innerText = `最高分：${data.highScore}`;
      });
    gameOverShown = true;
  }
}

// ==== 关卡与流程 ====
function restartLevel() {
  bossActive = false;
  boss = null;
  enemies = [];
  bosses = [];
  bullets = [];
  enemyBullets = [];
  supplies = [];
  explosions = [];
  hero.hp = HERO_PLANE_PROFILES[selectedPlaneIndex ?? 0].hp;
  hero.alive = true;
  hero.bombs = 0;
  hero.invincible = 0;
  hero.fire = 0;
  fireCooldown = 0;
  levelTipTimer = 120;
  gameOverShown = false;
  enemySpawnTimer = 0;
}
function startNewGame() {
  totalScore = 0;
  currentLevel = 0;
  restartLevel();
  gameStarted = true;
  gamePaused = false;
  levelPassed = false;
  lastFrameTime = performance.now();
  gameLoop();
  document.getElementById('reselectPlaneBtn').style.display = 'block';
}
function nextLevel() {
  currentLevel = Math.min(currentLevel + 1, loadedImages.backgrounds.length - 1);
  restartLevel();
  levelPassed = false;
}

// ==== 按钮事件 ====
document.getElementById('restartBtn').onclick = () => {
  playSound(SOUNDS.button);
  document.getElementById('restartBtn').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'none';
  restartLevel();
};
document.getElementById('nextBtn').onclick = () => {
  playSound(SOUNDS.button);
  document.getElementById('restartBtn').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'none';
  levelPassed = false;
  nextLevel();
  gamePaused = false;
  lastFrameTime = performance.now();
  gameLoop();
};

let gamePaused = false;
let gameStarted = false;
let animationId = null;
let lastFrameTime = performance.now();

document.getElementById('startBtn').onclick = () => {
  playSound(SOUNDS.button);
  if (!gameStarted) {
    startNewGame();
  } else if (gamePaused) {
    gamePaused = false;
    lastFrameTime = performance.now();
    gameLoop();
  }
  playSound(SOUNDS.game_music);
};
document.getElementById('pauseBtn').onclick = () => {
  playSound(SOUNDS.button);
  gamePaused = true;
  if (animationId) cancelAnimationFrame(animationId);
  SOUNDS.game_music.pause();
};
document.getElementById('endBtn').onclick = () => {
  playSound(SOUNDS.button);
  gamePaused = true;
  if (animationId) cancelAnimationFrame(animationId);
  gameStarted = false;
  SOUNDS.game_music.pause();
  if (currentUser)
    fetch('/api/score', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser.username, score: totalScore })
    }).then(r => r.json()).then(data => {
      document.getElementById('scoreBoard').innerText = `最高分：${data.highScore}`;
    });
};
document.getElementById('reselectPlaneBtn').onclick = function() {
  playSound(SOUNDS.button);
  gameDiv.style.display = 'none';
  rankBoard.style.display = 'none';
  gameStarted = false;
  document.getElementById('reselectPlaneBtn').style.display = 'none';
  planeSelectDiv.style.display = 'block';
  selectedPlaneIndex = null;
  for (let i = 0; i < 5; ++i) {
    document.getElementById('planeImg' + i).classList.remove('selected');
  }
  document.getElementById('confirmPlaneBtn').disabled = true;
  gamePaused = true;
  if (animationId) cancelAnimationFrame(animationId);
  SOUNDS.game_music.pause();
};

// ==== 主循环 ====
function gameLoop() {
  if (gamePaused) return;
  if (animationId) cancelAnimationFrame(animationId);

  let now = performance.now();
  let delta = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(delta);
  handleKeys(delta);
  if (hero.invincible > 0) hero.invincible--;
  drawHero();
  updateBullets(delta);
  tryAutoSpawnEnemy(delta);
  updateEnemies(delta);
  updateBosses(delta);
  updateSupplies(delta);
  updateEnemyBullets(delta);
  enemyShoot(delta);
  updateExplosions();
  drawSkillAnim();
//   updateBullets：所有玩家子弹的移动、碰撞、消失等。
// tryAutoSpawnEnemy：检查是否需要生成新的敌机。
// updateEnemies：所有敌机的移动、绘制、与英雄/子弹碰撞等。
// updateBosses：Boss的移动、攻击、爆炸动画等。
// updateSupplies：道具的移动、拾取、消失等。
// updateEnemyBullets：敌人子弹的移动、与英雄碰撞等。
// enemyShoot：敌人/Boss是否发射子弹。
// updateExplosions：所有爆炸动画的更新和清除。
// drawSkillAnim：技能动画的播放。
  if (levelPassed) {
    ctx.font = '40px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText('关卡通过！点击“下一关”进入下一关', canvas.width / 2, canvas.height / 2);
    return;
  }
  if (!bossActive && totalScore >= 20 * (currentLevel + 1)) {
    bossActive = true;
    spawnBoss();
    enemies = [];
  }
  drawScoreAndRank();
  drawLevelTip();
  drawGameOver();
  // 发起下一帧的动画循环
  animationId = requestAnimationFrame(gameLoop);
}
// 资源定时器加载
loadImages(ASSETS, () => {
  setInterval(spawnSupply, 15000);
  levelTipTimer = 120;
});