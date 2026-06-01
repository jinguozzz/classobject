const LEVELS = [
  {
    enemy: { hp: 1, speed: 2, count: 10, bulletChance: 0.01, type: 0 },
    boss: { hp: 80, speed: 1, bulletChance: 0.02, pattern: 0 },
    bg: 0,
    supplyRate: 15000
  },
  {
    enemy: { hp: 2, speed: 3, count: 13, bulletChance: 0.012, type: 1 },
    boss: { hp: 110, speed: 1.2, bulletChance: 0.025, pattern: 1 },
    bg: 1,
    supplyRate: 12000
  },
  {
    enemy: { hp: 3, speed: 3.5, count: 16, bulletChance: 0.014, type: 1 },
    boss: { hp: 160, speed: 1.3, bulletChance: 0.03, pattern: 2 },
    bg: 2,
    supplyRate: 9000
  },
  {
    enemy: { hp: 4, speed: 4, count: 20, bulletChance: 0.016, type: 0 },
    boss: { hp: 200, speed: 1.4, bulletChance: 0.03, pattern: 3 },
    bg: 3,
    supplyRate: 7000
  }
];