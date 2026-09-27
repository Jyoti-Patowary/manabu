import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllReaders,
  getReadersByLevel,
  getReaderById,
  extractStoryContentWords,
  calculateReadingReadiness,
  isTokenInSrsQueue,
} from './readingData.js';

describe('readingData library', () => {
  it('loads all graded reader stories across JLPT levels', () => {
    const all = getAllReaders();
    assert.ok(all.length >= 3);
    assert.ok(all.some((r) => r.jlpt === 'N5'));
    assert.ok(all.some((r) => r.jlpt === 'N4'));
    assert.ok(all.some((r) => r.jlpt === 'N3'));
  });

  it('filters stories by level', () => {
    const n5s = getReadersByLevel('N5');
    assert.ok(n5s.length >= 1);
    assert.ok(n5s.every((s) => s.jlpt === 'N5'));
  });

  it('retrieves a story by ID with structured tokens', () => {
    const story = getReaderById('reader-n5-tanaka-daily');
    assert.ok(story !== null);
    assert.equal(story.title, '田中さんの一日');
    assert.ok(Array.isArray(story.sentences));
    assert.ok(story.sentences[0].tokens.length >= 3);
  });

  it('extracts unique content words from a story, skipping particles and punctuation', () => {
    const story = getReaderById('reader-n5-tanaka-daily');
    const words = extractStoryContentWords(story);
    assert.ok(words.length >= 5);
    assert.ok(words.every((w) => w.type !== 'punct' && w.type !== 'particle'));
    assert.ok(words.some((w) => w.surface === '毎朝' || w.base === '毎朝'));
  });

  it('calculates reading readiness score based on user SRS intervals', () => {
    const story = getReaderById('reader-n5-tanaka-daily');
    const contentWords = extractStoryContentWords(story);

    // Case 1: Empty user cards -> 0% readiness
    const emptyResult = calculateReadingReadiness(story, []);
    assert.equal(emptyResult.readinessPercent, 0);
    assert.equal(emptyResult.stableCount, 0);

    // Case 2: Half of the words mastered at 14 days interval
    const halfCount = Math.floor(contentWords.length / 2);
    const userCards = contentWords.slice(0, halfCount).map((w) => ({
      kanji: w.base || w.surface,
      reading: w.reading,
      interval: 14,
      repetitions: 3,
    }));

    const partialResult = calculateReadingReadiness(story, userCards);
    assert.ok(partialResult.readinessPercent > 40 && partialResult.readinessPercent <= 60);
    assert.equal(partialResult.stableCount, halfCount);

    // Case 3: All words mastered
    const allUserCards = contentWords.map((w) => ({
      kanji: w.base || w.surface,
      reading: w.reading,
      interval: 21,
      repetitions: 4,
    }));

    const fullResult = calculateReadingReadiness(story, allUserCards);
    assert.equal(fullResult.readinessPercent, 100);
    assert.equal(fullResult.statusLabel, 'Ready to Read!');
  });

  it('detects tokens active in the user SRS queue for in-text reinforcement', () => {
    const token = { surface: '食べる', base: '食べる', reading: 'たべる', type: 'vocab' };
    const userCards = [
      {
        id: 'card-taberu-1',
        kanji: '食べる',
        interval: 3,
        repetitions: 1,
        dueDate: Date.now() - 1000, // overdue
      },
    ];

    const match = isTokenInSrsQueue(token, userCards);
    assert.ok(match !== null);
    assert.equal(match.isDue, true);
    assert.equal(match.isLearning, true);
    assert.equal(match.interval, 3);
  });
});

