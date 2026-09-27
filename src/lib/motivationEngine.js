/**
 * Motivation Engine: Exam Readiness %, Quality-Based Streaks, and Time-to-Fluency Estimation
 */

export const JLPT_BENCHMARKS = {
  N5: { vocab: 800, kanji: 103, grammar: 85, totalHours: 350 },
  N4: { vocab: 1500, kanji: 300, grammar: 130, totalHours: 600 },
  N3: { vocab: 3750, kanji: 650, grammar: 200, totalHours: 1000 },
  N2: { vocab: 6000, kanji: 1000, grammar: 300, totalHours: 1600 },
  N1: { vocab: 10000, kanji: 2000, grammar: 450, totalHours: 2400 },
};

export const QUALITY_STREAK_RULES = {
  MIN_REVIEWS_PER_DAY: 5,
  MIN_ACCURACY_THRESHOLD: 0.70, // 70% accuracy required to qualify
};

/**
 * Normalizes JLPT level string to 'N5', 'N4', 'N3', 'N2', 'N1'
 */
export function normalizeLevel(level) {
  if (!level) return 'N5';
  const match = String(level).toUpperCase().match(/N[1-5]/);
  return match ? match[0] : 'N5';
}

/**
 * Calculates Exam Readiness % for a given target JLPT level based on actual user card SRS intervals.
 * - Stable Cards (interval >= 7 days): 100% mastery credit
 * - In-Learning Cards (interval 1 to 6 days): 50% partial credit
 * - Unstudied / Interval 0: 0% credit
 *
 * Weighted formula:
 * - Vocabulary: 40%
 * - Kanji: 30%
 * - Grammar: 30%
 *
 * @param {Array} userCards - All user cards across decks
 * @param {string} targetLevel - 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 */
export function calculateExamReadiness(userCards = [], targetLevel = 'N5') {
  const level = normalizeLevel(targetLevel);
  const benchmark = JLPT_BENCHMARKS[level] || JLPT_BENCHMARKS.N5;

  // Track counts per pillar
  const pillarStats = {
    vocab: { target: benchmark.vocab, stable: 0, learning: 0, totalCards: 0 },
    kanji: { target: benchmark.kanji, stable: 0, learning: 0, totalCards: 0 },
    grammar: { target: benchmark.grammar, stable: 0, learning: 0, totalCards: 0 },
  };

  (userCards || []).forEach((card) => {
    const cardLevel = normalizeLevel(card.jlpt_level || card.jlpt);
    // Include cards at or below target level (e.g. studying for N3 includes N5, N4, and N3 foundations)
    const cardLevelNum = parseInt(cardLevel.replace('N', ''), 10);
    const targetLevelNum = parseInt(level.replace('N', ''), 10);

    // In JLPT, N5 is beginner, N1 is advanced, so cardLevelNum >= targetLevelNum means at or below target level
    if (cardLevelNum < targetLevelNum) {
      return; // card is higher than target level
    }

    let type = card.content_type || card.type || 'vocab';
    if (type === 'hiragana' || type === 'katakana' || type === 'kana') return; // kana doesn't count towards JLPT exam
    if (type !== 'kanji' && type !== 'grammar') type = 'vocab';

    const stat = pillarStats[type];
    stat.totalCards += 1;

    const interval = card.interval || 0;
    if (interval >= 7) {
      stat.stable += 1;
    } else if (interval > 0 || (card.repetitions || 0) > 0) {
      stat.learning += 1;
    }
  });

  // Calculate weighted readiness for each pillar
  const computePillarScore = (stat) => {
    const effectiveMastery = stat.stable + stat.learning * 0.5;
    return Math.min(100, Math.round((effectiveMastery / stat.target) * 100));
  };

  const vocabScore = computePillarScore(pillarStats.vocab);
  const kanjiScore = computePillarScore(pillarStats.kanji);
  const grammarScore = computePillarScore(pillarStats.grammar);

  // 40% Vocab + 30% Kanji + 30% Grammar
  const compositeScore = Math.min(100, Math.round(
    vocabScore * 0.40 + kanjiScore * 0.30 + grammarScore * 0.30
  ));

  return {
    targetLevel: level,
    readinessPercent: compositeScore,
    breakdown: {
      vocab: {
        score: vocabScore,
        stable: pillarStats.vocab.stable,
        learning: pillarStats.vocab.learning,
        target: pillarStats.vocab.target,
      },
      kanji: {
        score: kanjiScore,
        stable: pillarStats.kanji.stable,
        learning: pillarStats.kanji.learning,
        target: pillarStats.kanji.target,
      },
      grammar: {
        score: grammarScore,
        stable: pillarStats.grammar.stable,
        learning: pillarStats.grammar.learning,
        target: pillarStats.grammar.target,
      },
    },
    totalMastered: pillarStats.vocab.stable + pillarStats.kanji.stable + pillarStats.grammar.stable,
  };
}

/**
 * Calculates quality-based streak.
 * A day qualifies IF:
 *   1. reviewCount >= MIN_REVIEWS_PER_DAY (5)
 *   2. accuracy >= MIN_ACCURACY_THRESHOLD (0.70)
 *
 * @param {Array} history - Array of { date: 'YYYY-MM-DD', count: number, correct: number, accuracy: number }
 * @param {string} todayDateStr - Optional 'YYYY-MM-DD', defaults to local today
 */
export function calculateQualityStreak(history = [], todayDateStr = null) {
  const today = todayDateStr || new Date().toISOString().split('T')[0];

  // Map history by date string
  const historyMap = new Map();
  (history || []).forEach((h) => {
    if (h && h.date) {
      const accuracy = h.count > 0 ? (h.correct || 0) / h.count : 0;
      const qualified = h.count >= QUALITY_STREAK_RULES.MIN_REVIEWS_PER_DAY &&
                        accuracy >= QUALITY_STREAK_RULES.MIN_ACCURACY_THRESHOLD;
      historyMap.set(h.date, { ...h, accuracy, qualified });
    }
  });

  const todayRecord = historyMap.get(today) || {
    date: today,
    count: 0,
    correct: 0,
    accuracy: 0,
    qualified: false,
  };

  const remainingToQualify = Math.max(0, QUALITY_STREAK_RULES.MIN_REVIEWS_PER_DAY - todayRecord.count);

  // Walk backwards from yesterday (or today if today is qualified) to count contiguous streak
  let currentStreak = 0;
  let cursorDate = new Date(today);

  // If today is qualified, streak includes today
  if (todayRecord.qualified) {
    currentStreak += 1;
    cursorDate.setDate(cursorDate.getDate() - 1);
  } else {
    // Check if yesterday qualified, if not, current streak is 0
    cursorDate.setDate(cursorDate.getDate() - 1);
  }

  // Count unbroken previous qualified days
  while (true) {
    const dStr = cursorDate.toISOString().split('T')[0];
    const rec = historyMap.get(dStr);
    if (rec && rec.qualified) {
      currentStreak += 1;
      cursorDate.setDate(cursorDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Find longest streak ever in history
  const sortedDates = Array.from(historyMap.keys()).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevTimestamp = null;

  for (const dateStr of sortedDates) {
    const rec = historyMap.get(dateStr);
    if (rec.qualified) {
      const currentTimestamp = new Date(dateStr).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (prevTimestamp === null || Math.round((currentTimestamp - prevTimestamp) / oneDayMs) === 1) {
        tempStreak += 1;
      } else {
        tempStreak = 1;
      }
      prevTimestamp = currentTimestamp;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
      prevTimestamp = null;
    }
  }

  if (currentStreak > longestStreak) longestStreak = currentStreak;

  // Build 14-day activity summary
  const recentDays = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const rec = historyMap.get(dStr) || { date: dStr, count: 0, correct: 0, accuracy: 0, qualified: false };
    recentDays.push(rec);
  }

  return {
    currentStreak,
    longestStreak,
    todayStatus: {
      count: todayRecord.count,
      accuracy: Math.round(todayRecord.accuracy * 100),
      qualified: todayRecord.qualified,
      remainingToQualify,
    },
    recentDays,
  };
}

/**
 * Records a single card review rating into the history array and returns updated array.
 * @param {Array} currentHistory
 * @param {number} rating - 1 (Again), 2 (Good), 3 (Easy)
 * @param {string} dateStr - 'YYYY-MM-DD'
 */
export function recordReviewResult(currentHistory = [], rating, dateStr = null) {
  const today = dateStr || new Date().toISOString().split('T')[0];
  const historyCopy = [...(currentHistory || [])];
  const existingIdx = historyCopy.findIndex((h) => h.date === today);

  const isCorrect = rating >= 2;

  if (existingIdx !== -1) {
    const existing = historyCopy[existingIdx];
    const newCount = (existing.count || 0) + 1;
    const newCorrect = (existing.correct || 0) + (isCorrect ? 1 : 0);
    historyCopy[existingIdx] = {
      ...existing,
      count: newCount,
      correct: newCorrect,
      accuracy: newCount > 0 ? newCorrect / newCount : 0,
    };
  } else {
    historyCopy.push({
      date: today,
      count: 1,
      correct: isCorrect ? 1 : 0,
      accuracy: isCorrect ? 1.0 : 0.0,
    });
  }

  return historyCopy;
}

/**
 * Projects estimated completion date (Time-to-Fluency) for target JLPT level.
 *
 * @param {Array} userCards
 * @param {string} targetLevel
 * @param {number} dailyPace - cards reviewed per day (e.g. 15)
 * @param {number} accuracyRate - estimated retention rate (e.g. 0.80)
 * @param {Date} startDate - Reference start date
 */
export function estimateTimeToFluency(
  userCards = [],
  targetLevel = 'N5',
  dailyPace = 15,
  accuracyRate = 0.85,
  startDate = new Date()
) {
  const level = normalizeLevel(targetLevel);
  const benchmark = JLPT_BENCHMARKS[level] || JLPT_BENCHMARKS.N5;
  const totalRequired = benchmark.vocab + benchmark.kanji + benchmark.grammar;

  const readiness = calculateExamReadiness(userCards, targetLevel);
  const effectiveMastered = (
    readiness.breakdown.vocab.stable +
    readiness.breakdown.kanji.stable +
    readiness.breakdown.grammar.stable +
    (readiness.breakdown.vocab.learning + readiness.breakdown.kanji.learning + readiness.breakdown.grammar.learning) * 0.5
  );

  // Target 85% curriculum mastery for solid exam clearance
  const passingTargetCards = Math.round(totalRequired * 0.85);
  const remainingCards = Math.max(0, passingTargetCards - effectiveMastered);

  const safePace = Math.max(1, dailyPace);
  const safeAccuracy = Math.max(0.4, Math.min(1.0, accuracyRate));
  const effectiveDailyProgress = safePace * safeAccuracy;

  const daysToFluency = Math.ceil(remainingCards / effectiveDailyProgress);

  const projectedDate = new Date(startDate);
  projectedDate.setDate(projectedDate.getDate() + daysToFluency);

  return {
    targetLevel: level,
    totalRequired,
    effectiveMastered: Math.round(effectiveMastered),
    remainingCards,
    dailyPace: safePace,
    accuracyRate: safeAccuracy,
    daysToFluency,
    projectedDate: projectedDate.toISOString().split('T')[0],
    projectedDateFormatted: projectedDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}

