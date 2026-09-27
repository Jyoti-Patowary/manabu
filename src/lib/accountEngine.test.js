const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateInternalLevel, INTERNAL_TITLES, XP_REWARDS, getWeeklyLeaderboard } = require('./accountEngine');

test('accountEngine: calculateInternalLevel calculates levels and titles accurately', () => {
  const lvl0 = calculateInternalLevel(0);
  assert.equal(lvl0.level, 1);
  assert.equal(lvl0.title, '見習い');
  assert.equal(lvl0.badge, '🌱');

  // 40 XP -> Level 2
  const lvl2 = calculateInternalLevel(45);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.title, '見習い');

  // 1000 XP -> sqrt(1000/40) = sqrt(25) = 5 -> Level 6 (修行者)
  const lvl6 = calculateInternalLevel(1000);
  assert.equal(lvl6.level, 6);
  assert.equal(lvl6.title, '修行者');

  // 4000 XP -> sqrt(4000/40) = 10 -> Level 11 (侍)
  const lvl11 = calculateInternalLevel(4000);
  assert.equal(lvl11.level, 11);
  assert.equal(lvl11.title, '侍');
  assert.equal(lvl11.badge, '🏯');
});

test('accountEngine: percent to next level is bounded between 0 and 100', () => {
  const info = calculateInternalLevel(150);
  assert.ok(info.percentToNext >= 0 && info.percentToNext <= 100);
  assert.ok(info.xpToNext >= 0);
});

test('accountEngine: weekly leaderboard respects opt-in flag', () => {
  const privateLeaderboard = getWeeklyLeaderboard(1500, false);
  assert.equal(privateLeaderboard.isOptIn, false);
  assert.equal(privateLeaderboard.peers.length, 0);

  const publicLeaderboard = getWeeklyLeaderboard(1500, true);
  assert.equal(publicLeaderboard.isOptIn, true);
  assert.ok(publicLeaderboard.peers.length > 0);
  const self = publicLeaderboard.peers.find(p => p.isSelf);
  assert.ok(self);
  assert.equal(self.xp, 1500);
});

