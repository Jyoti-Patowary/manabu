import test from 'node:test';
import assert from 'node:assert/strict';
import { isLessonGated, calculateSM2, canCompleteLessonGrammar } from './courseEngine.js';

test('courseEngine: isLessonGated properly enforces prerequisite dependencies', () => {
  const lesson1 = { _id: 'l1', order: 1, prerequisiteLessonIds: [] };
  const lesson2 = { _id: 'l2', order: 2, prerequisiteLessonIds: ['l1'] };
  const lesson3 = { _id: 'l3', order: 3, prerequisiteLessonIds: ['l1', 'l2'] };

  // Lesson 1 has no prerequisites -> never gated
  assert.equal(isLessonGated(lesson1, []), false);

  // Lesson 2 requires Lesson 1 -> gated when l1 not completed
  assert.equal(isLessonGated(lesson2, []), true);
  assert.equal(isLessonGated(lesson2, ['l1']), false);

  // Lesson 3 requires both l1 and l2 -> gated if only l1 is completed
  assert.equal(isLessonGated(lesson3, ['l1']), true);
  assert.equal(isLessonGated(lesson3, ['l1', 'l2']), false);
});

test('courseEngine: calculateSM2 updates intervals and repetitions according to user rating', () => {
  const newCard = { interval: 0, repetitions: 0, easeFactor: 2.5 };

  // First Good review (rating 3) -> interval becomes 1, repetitions becomes 1
  const step1 = calculateSM2(newCard, 3);
  assert.equal(step1.repetitions, 1);
  assert.equal(step1.interval, 1);
  assert.ok(step1.nextReviewDate instanceof Date);
  assert.equal(step1.mastered, false);

  // Second Good review (rating 3) -> interval becomes 6, repetitions becomes 2
  const step2 = calculateSM2(step1, 3);
  assert.equal(step2.repetitions, 2);
  assert.equal(step2.interval, 6);

  // Third Good review (rating 3) -> interval multiplies by easeFactor (6 * 2.22 = 13)
  const step3 = calculateSM2(step2, 3);
  assert.equal(step3.repetitions, 3);
  assert.equal(step3.interval, 13);
  assert.equal(step3.mastered, true); // repetitions >= 2 && interval >= 7

  // Failure review (rating 1 - Again) -> resets repetitions to 0, interval to 1
  const failed = calculateSM2(step3, 1);
  assert.equal(failed.repetitions, 0);
  assert.equal(failed.interval, 1);
  assert.ok(failed.easeFactor < step3.easeFactor); // ease factor penalized
  assert.equal(failed.mastered, false);
});

test('courseEngine: canCompleteLessonGrammar enforces granular enrollment per grammar point', () => {
  // Lessons with 0 grammar points (e.g. Hiragana / Katakana / Kanji basics) can always complete
  const noGrammar = canCompleteLessonGrammar([], []);
  assert.equal(noGrammar.canComplete, true);
  assert.equal(noGrammar.remainingCount, 0);

  // Lesson with 3 grammar points, none enrolled -> cannot complete
  const allMissing = canCompleteLessonGrammar(['g1', 'g2', 'g3'], []);
  assert.equal(allMissing.canComplete, false);
  assert.equal(allMissing.remainingCount, 3);
  assert.deepEqual(allMissing.missingIds, ['g1', 'g2', 'g3']);

  // Lesson with 3 grammar points, only 2 enrolled -> cannot complete, 1 remaining
  const partial = canCompleteLessonGrammar(['g1', 'g2', 'g3'], ['g1', 'g3']);
  assert.equal(partial.canComplete, false);
  assert.equal(partial.remainingCount, 1);
  assert.deepEqual(partial.missingIds, ['g2']);

  // All 3 grammar points enrolled -> can complete
  const allDone = canCompleteLessonGrammar(['g1', 'g2', 'g3'], ['g1', 'g2', 'g3']);
  assert.equal(allDone.canComplete, true);
  assert.equal(allDone.remainingCount, 0);
  assert.deepEqual(allDone.missingIds, []);
});

