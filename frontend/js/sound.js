const SOUNDS = {
  bullet: new Audio('assets/audio/bullet.wav'),
  button: new Audio('assets/audio/button.wav'),
  enemy1_down: new Audio('assets/audio/enemy1_down.wav'),
  enemy2_down: new Audio('assets/audio/enemy2_down.wav'),
  enemy3_down: new Audio('assets/audio/enemy3_down.wav'),
  enemy3_flying: new Audio('assets/audio/enemy3_flying.wav'),
  game_music: new Audio('assets/audio/game_music.ogg'),
  get_bomb: new Audio('assets/audio/get_bomb.wav'),
  get_bullet: new Audio('assets/audio/get_bullet.wav'),
  me_down: new Audio('assets/audio/me_down.wav'),
  supply: new Audio('assets/audio/supply.wav'),
  upgrade: new Audio('assets/audio/upgrade.wav'),
  use_bomb: new Audio('assets/audio/use_bomb.wav'),
  skill: new Audio('assets/audio/skill.wav'),
  boss_down: new Audio('assets/audio/boss_down.wav')
};
SOUNDS.game_music.loop = true;

function playSound(sound) {
  if (!sound) return;
  try {
    sound.pause();
    sound.currentTime = 0;
    sound.play();
  } catch (e) {}
}