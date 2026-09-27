import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExamReadiness,
  calculateQualityStreak,
  recordReviewResult,
  estimateTimeToFluency,
  normalizeLevel,
} from './motivationEngine.js';

describe('motivationEngine', () => {
  it('normalizes JLPT levels accurately', () => {
    assert.equal(normalizeLevel('n5'), 'N5');
    assert.equal(normalizeLevel('JLPT N3'), 'N3');
    assert.equal(normalizeLevel('N2'), 'N2');
    assert.equal(normalizeLevel(null), 'N5');
  });

  it('calculates multi-pillar weighted exam readiness with stable and learning intervals', () => {
    const mockCards = [
      // 50 stable vocab cards
      ...Array.from({ length: 50 }, (_, i) => ({
        id: `v-${i}`,
        content_type: 'vocab',
        jlpt_level: 'N5',
        interval: 10,
        repetitions: 3,
      })),
      // 20 in-learning vocab cards (counts 50% credit = 10)
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `vl-${i}`,
        content_type: 'vocab',
        jlpt_level: 'N5',
        interval: 3,
        repetitions: 1,
      })),
      // 10 stable kanji cards
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `k-${i}`,
        content_type: 'kanji',
        jlpt_level: 'N5',
        interval: 14,
        repetitions: 4,
      })),
      // 10 stable grammar cards
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `g-${i}`,
        content_type: 'grammar',
        jlpt_level: 'N5',
        interval: 8,
        repetitions: 2,
      })),
    ];

    const result = calculateExamReadiness(mockCards, 'N5');
    assert.equal(result.targetLevel, 'N5');
    // Vocab: target is 800. Effective = 50 + 10 = 60. 60 / 800 = 7.5% -> round 8%
    assert.equal(result.breakdown.vocab.stable, 50);
    assert.equal(result.breakdown.vocab.learning, 20);
    assert.equal(result.breakdown.vocab.score, 8);

    // Kanji: target is 103. Effective = 10. 10 / 103 = 9.7% -> round 10%
    assert.equal(result.breakdown.kanji.stable, 10);
    assert.equal(result.breakdown.kanji.score, 10);

    // Grammar: target is 85. Effective = 10. 10 / 85 = 11.76% -> round 12%
    assert.equal(result.breakdown.grammar.stable, 10);
    assert.equal(result.breakdown.grammar.score, 12);

    // Weighted composite: 8 * 0.40 + 10 * 0.30 + 12 * 0.30 = 3.2 + 3 + 3.6 = 9.8 -> round 10%
    assert.equal(result.readinessPercent, 10);
  });

  it('evaluates quality streak requiring >= 5 reviews AND >= 70% accuracy', () => {
    // 3 days:
    // Day 1: 10 reviews, 8 correct (80%) -> Qualified
    // Day 2: 6 reviews, 5 correct (83%) -> Qualified
    // Today: 4 reviews, 4 correct (100%) -> NOT qualified yet (needs 5 reviews)
    const history = [
      { date: '2026-09-20', count: 10, correct: 8 },
      { date: '2026-09-21', count: 6, correct: 5 },
      { date: '2026-09-22', count: 4, correct: 4 },
    ];

    const streak = calculateQualityStreak(history, '2026-09-22');
    assert.equal(streak.todayStatus.qualified, false);
    assert.equal(streak.todayStatus.remainingToQualify, 1);
    // Active streak from yesterday: 2 days
    assert.equal(streak.currentStreak, 2);

    // Now record 1 more review with correct rating (rating 2 = Good)
    const updatedHistory = recordReviewResult(history, 2, '2026-09-22');
    const updatedStreak = calculateQualityStreak(updatedHistory, '2026-09-22');
    assert.equal(updatedStreak.todayStatus.count, 5);
    assert.equal(updatedStreak.todayStatus.qualified, true);
    // Streak now advances to 3!
    assert.equal(updatedStreak.currentStreak, 3);
  });

  it('resets streak if previous day did not qualify', () => {
    const history = [
      { date: '2026-09-18', count: 10, correct: 9 }, // Qualified
      { date: '2026-09-19', count: 2, correct: 2 },  // Disqualified (< 5 reviews)
      { date: '2026-09-20', count: 10, correct: 4 }, // Disqualified (< 70% accuracy)
      { date: '2026-09-21', count: 8, correct: 7 },  // Qualified
      { date: '2026-09-22', count: 6, correct: 6 },  // Qualified
    ];

    const streak = calculateQualityStreak(history, '2026-09-22');
    assert.equal(streak.currentStreak, 2);
  });

  it('projects time-to-fluency accurately with pace adjustments', () => {
    const mockCards = [
      // 100 stable cards
      ...Array.from({ length: 100 }, (_, i) => ({
        id: `v-${i}`,
        content_type: 'vocab',
        jlpt_level: 'N5',
        interval: 10,
      })),
    ];

    const fixedStartDate = new Date('2026-09-01T00:00:00Z');
    const estimate = estimateTimeToFluency(mockCards, 'N5', 10, 0.85, fixedStartDate);

    assert.equal(estimate.targetLevel, 'N5');
    assert.ok(estimate.remainingCards > 0);
    assert.ok(estimate.daysToFluency > 0);
    assert.ok(estimate.projectedDate.startsWith('202'));
  });
});

