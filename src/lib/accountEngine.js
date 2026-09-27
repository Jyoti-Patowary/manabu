/**
 * src/lib/accountEngine.js
 * User account, gamification, and internal progression engine:
 * - App-Internal Leveling (distinct from JLPT levels): 見習い -> 修行者 -> 侍 -> 達人 -> 師範 -> 名人
 * - XP Awards: Reviews (+10 XP), Lessons (+15 XP), Drills (+25 XP), Mock Exams (+100 XP)
 * - Saved Mock Exam history & score trend tracking
 * - Optional Weekly Leaderboard (strictly opt-in, default private)
 */

export const INTERNAL_TITLES = [
  { minLevel: 1, maxLevel: 4, title: '見習い', titleEn: 'Apprentice', badge: '🌱' },
  { minLevel: 5, maxLevel: 9, title: '修行者', titleEn: 'Seeker', badge: '⚔️' },
  { minLevel: 10, maxLevel: 19, title: '侍', titleEn: 'Samurai', badge: '🏯' },
  { minLevel: 20, maxLevel: 34, title: '達人', titleEn: 'Master', badge: '🥋' },
  { minLevel: 35, maxLevel: 49, title: '師範', titleEn: 'Instructor', badge: '📜' },
  { minLevel: 50, maxLevel: Infinity, title: '名人', titleEn: 'Grandmaster', badge: '👑' },
];

export const XP_REWARDS = {
  SRS_REVIEW: 10,
  LESSON_STUDY: 15,
  ADAPTIVE_DRILL: 25,
  MOCK_EXAM: 100,
};

/**
 * Calculates internal app level from total XP
 */
export function calculateInternalLevel(xp = 0) {
  const safeXp = Math.max(0, Number(xp) || 0);
  // Level formula: Level = floor(sqrt(XP / 40)) + 1
  const level = Math.floor(Math.sqrt(safeXp / 40)) + 1;
  const currentLevelBaseXp = Math.pow(level - 1, 2) * 40;
  const nextLevelXp = Math.pow(level, 2) * 40;
  const progressInLevel = safeXp - currentLevelBaseXp;
  const requiredForNextLevel = nextLevelXp - currentLevelBaseXp;
  const percentToNext = Math.min(100, Math.max(0, Math.round((progressInLevel / requiredForNextLevel) * 100)));

  const titleEntry = INTERNAL_TITLES.find(t => level >= t.minLevel && level <= t.maxLevel) || INTERNAL_TITLES[0];

  return {
    level,
    xp: safeXp,
    title: titleEntry.title,
    titleEn: titleEntry.titleEn,
    badge: titleEntry.badge,
    currentLevelBaseXp,
    nextLevelXp,
    percentToNext,
    xpToNext: Math.max(0, nextLevelXp - safeXp),
  };
}

/**
 * Retrieves the local user account state from localStorage
 */
export function getLocalAccount() {
  if (typeof window === 'undefined') {
    return {
      xp: 0,
      username: '学習者 (Learner)',
      isLeaderboardOptIn: false,
      examHistory: [],
      completedLessons: [],
      completedDrills: 0,
      ...calculateInternalLevel(0),
    };
  }

  try {
    const raw = localStorage.getItem('manabu-account');
    const parsed = raw ? JSON.parse(raw) : {};
    const xp = Number(parsed.xp) || 0;
    const levelInfo = calculateInternalLevel(xp);

    return {
      xp,
      username: parsed.username || '学習者 (Learner)',
      isLeaderboardOptIn: Boolean(parsed.isLeaderboardOptIn),
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      completedDrills: Number(parsed.completedDrills) || 0,
      ...levelInfo,
    };
  } catch (e) {
    console.error('Failed to parse account from storage:', e);
    return {
      xp: 0,
      username: '学習者 (Learner)',
      isLeaderboardOptIn: false,
      examHistory: [],
      completedLessons: [],
      completedDrills: 0,
      ...calculateInternalLevel(0),
    };
  }
}

/**
 * Awards XP to user and updates localStorage
 */
export function awardXp(amount, reason = 'activity') {
  if (typeof window === 'undefined') return calculateInternalLevel(amount);

  try {
    const account = getLocalAccount();
    const newXp = account.xp + Math.max(0, Number(amount) || 0);
    const updated = {
      ...account,
      xp: newXp,
      updatedAt: Date.now(),
    };

    localStorage.setItem('manabu-account', JSON.stringify(updated));
    return calculateInternalLevel(newXp);
  } catch (e) {
    console.error('Failed to award XP:', e);
    return calculateInternalLevel(0);
  }
}

/**
 * Saves a completed mock exam result
 */
export function recordMockExamResult(examResult) {
  if (typeof window === 'undefined') return [];

  try {
    const account = getLocalAccount();
    const entry = {
      id: `exam-${Date.now()}`,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      level: examResult.level || 'N5',
      score: examResult.score || 0,
      maxScore: examResult.maxScore || 180,
      percent: examResult.percent || 0,
      passed: Boolean(examResult.passed),
      sections: examResult.sections || {},
    };

    const newHistory = [entry, ...(account.examHistory || [])].slice(0, 30);
    const updated = {
      ...account,
      xp: account.xp + XP_REWARDS.MOCK_EXAM,
      examHistory: newHistory,
    };

    localStorage.setItem('manabu-account', JSON.stringify(updated));
    return newHistory;
  } catch (e) {
    console.error('Failed to record exam result:', e);
    return [];
  }
}

/**
 * Saves arbitrary local account fields to localStorage
 */
export function saveLocalAccount(updatedAccount) {
  if (typeof window === 'undefined') return updatedAccount;
  try {
    localStorage.setItem('manabu-account', JSON.stringify(updatedAccount));
    return updatedAccount;
  } catch (e) {
    console.error('Failed to save account to storage:', e);
    return updatedAccount;
  }
}

/**
 * Toggles the opt-in weekly leaderboard
 */
export function setLeaderboardOptIn(optIn) {
  if (typeof window === 'undefined') return;
  try {
    const account = getLocalAccount();
    account.isLeaderboardOptIn = Boolean(optIn);
    localStorage.setItem('manabu-account', JSON.stringify(account));
  } catch (e) {
    console.error('Failed to set leaderboard opt-in:', e);
  }
}

export function toggleLeaderboardOptIn() {
  if (typeof window === 'undefined') return { isLeaderboardOptIn: false };
  try {
    const account = getLocalAccount();
    account.isLeaderboardOptIn = !account.isLeaderboardOptIn;
    localStorage.setItem('manabu-account', JSON.stringify(account));
    return account;
  } catch (e) {
    console.error('Failed to toggle leaderboard opt-in:', e);
    return { isLeaderboardOptIn: false };
  }
}

/**
 * Generates simulated peer weekly leaderboard rankings (with user positioned correctly)
 */
export function getWeeklyLeaderboard(userXp = 0, isOptIn = false) {
  const peers = [
    { rank: 1, name: 'Sakura_Tokyo', title: '達人 (Master)', xp: 3240, streak: 28 },
    { rank: 2, name: 'Kenji_JLPT', title: '侍 (Samurai)', xp: 2890, streak: 19 },
    { rank: 3, name: 'Alex_N2', title: '侍 (Samurai)', xp: 2450, streak: 14 },
    { rank: 4, name: 'Yuki_M', title: '侍 (Samurai)', xp: 1980, streak: 12 },
    { rank: 5, name: 'StudyDojo', title: '修行者 (Seeker)', xp: 1650, streak: 9 },
    { rank: 6, name: 'Haruto_99', title: '修行者 (Seeker)', xp: 1320, streak: 7 },
    { rank: 7, name: 'Elena_V', title: '修行者 (Seeker)', xp: 950, streak: 5 },
    { rank: 8, name: 'Hiroshi_K', title: '見習い (Apprentice)', xp: 680, streak: 4 },
  ];

  if (!isOptIn) return { isOptIn: false, peers: [] };

  const userEntry = {
    rank: 1,
    name: 'あなた (You)',
    title: calculateInternalLevel(userXp).title,
    xp: userXp,
    streak: 1,
    isSelf: true,
  };

  const all = [...peers, userEntry].sort((a, b) => b.xp - a.xp);
  all.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return {
    isOptIn: true,
    peers: all.slice(0, 10),
  };
}

