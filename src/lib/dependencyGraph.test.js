import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getPrerequisitesForGrammar,
  evaluateGrammarLockStatus,
  filterQueueByDependencies,
  getVocabUnlockingImpact,
  STABLE_INTERVAL_DAYS,
} from './dependencyGraph.js';

describe('dependencyGraph engine', () => {
  const sampleGrammar = {
    grammar: 'ないといけない',
    meaning: 'must do / have to do',
    example: '毎日勉強しないといけません。',
    grammarExamples: [
      { japanese: '薬を飲まないといけません。', reading: 'Kusuri o nomanai to ikemasen.', english: 'I have to take medicine.' },
      { japanese: '早く寝ないといけません。', reading: 'Hayaku nenai to ikemasen.', english: 'I have to go to bed early.' },
    ],
  };

  it('extracts relevant prerequisite vocabulary for grammar points', () => {
    const prereqs = getPrerequisitesForGrammar(sampleGrammar);
    assert.ok(Array.isArray(prereqs));
    assert.ok(prereqs.length >= 1);
    assert.ok(prereqs.some((p) => p.kanji === '毎日' || p.kanji === '勉強' || p.kanji === '薬'));
  });

  it('marks grammar as locked when prerequisites have not reached stable interval (0 or < 7 days)', () => {
    const userCards = [
      { kanji: '毎日', interval: 3, repetitions: 1 },
      { kanji: '勉強', interval: 1, repetitions: 1 },
    ];

    const status = evaluateGrammarLockStatus(sampleGrammar, userCards, 7);
    assert.equal(status.isUnlocked, false);
    assert.ok(status.readinessPercent < 100);
    assert.ok(status.stableCount < status.totalCount);
  });

  it('marks grammar as unlocked when all prerequisites reach stable interval (>= 7 days)', () => {
    const prereqs = getPrerequisitesForGrammar(sampleGrammar);
    const userCards = prereqs.map((p) => ({
      kanji: p.kanji,
      reading: p.reading,
      interval: 14,
      repetitions: 3,
    }));

    const status = evaluateGrammarLockStatus(sampleGrammar, userCards, 7);
    assert.equal(status.isUnlocked, true);
    assert.equal(status.readinessPercent, 100);
    assert.equal(status.stableCount, status.totalCount);
    assert.ok(status.prerequisites.every((p) => p.isStable));
  });

  it('computes partial readiness percentage correctly', () => {
    const prereqs = getPrerequisitesForGrammar(sampleGrammar);
    if (prereqs.length >= 2) {
      const userCards = [
        { kanji: prereqs[0].kanji, reading: prereqs[0].reading, interval: 10, repetitions: 2 }, // stable
        { kanji: prereqs[1].kanji, reading: prereqs[1].reading, interval: 2, repetitions: 1 },  // learning
      ];

      const status = evaluateGrammarLockStatus(sampleGrammar, userCards, 7);
      assert.equal(status.isUnlocked, false);
      assert.ok(status.readinessPercent > 0 && status.readinessPercent < 100);
      assert.equal(status.stableCount, 1);
    }
  });

  it('filters queue in strict mode by withholding locked grammar cards', () => {
    const unlockedGrammar = {
      content_type: 'grammar',
      grammar: '〜です',
      example: '私は学生です。',
    };

    const lockedGrammar = {
      content_type: 'grammar',
      grammar: 'ないといけない',
      example: sampleGrammar.example,
      grammarExamples: sampleGrammar.grammarExamples,
    };

    const vocabCard = { content_type: 'vocab', kanji: '猫', meaning: 'cat' };

    const queue = [vocabCard, unlockedGrammar, lockedGrammar];
    const userVocab = []; // empty user progress

    const strictQueue = filterQueueByDependencies(queue, userVocab, { mode: 'strict' });
    // vocabCard should remain
    assert.ok(strictQueue.some((c) => c.kanji === '猫'));
    // lockedGrammar should be removed
    assert.ok(!strictQueue.some((c) => c.grammar === 'ないといけない'));

    const openQueue = filterQueueByDependencies(queue, userVocab, { mode: 'open' });
    // openQueue keeps all
    assert.equal(openQueue.length, 3);
  });

  it('discovers which grammar points a vocabulary word unlocks', () => {
    const impacted = getVocabUnlockingImpact('勉強');
    assert.ok(Array.isArray(impacted));
    assert.ok(impacted.length >= 1);
    assert.ok(impacted.some((i) => i.grammar.includes('ないといけない') || i.meaning.includes('must')));
  });
});

