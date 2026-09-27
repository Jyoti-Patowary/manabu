const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { migrateCard } = require(path.join(__dirname, '..', '..', 'scripts', 'migrate-unified-content.js'));

test('migrateCard converts kana cards to content_type: kana with null jlpt_level', () => {
  const inputHiragana = {
    type: 'hiragana',
    reading: 'か',
    meaning: 'ka',
    jlpt: 'N5',
    easeFactor: 2.5,
    dueDate: 100000,
  };

  const migrated = migrateCard(inputHiragana, 'Hiragana Basics');
  assert.equal(migrated.content_type, 'kana');
  assert.equal(migrated.jlpt_level, null);
  assert.equal(migrated.ease_factor, 2.5);
  assert.equal(migrated.easeFactor, 2.5);
  assert.equal(migrated.next_review_date, 100000);
  assert.equal(migrated.dueDate, 100000);
  assert.deepEqual(migrated.relationships, []);
});

test('migrateCard converts raw N3 vocab item to unified schema with N3 level', () => {
  const rawN3Item = {
    kanji: '明かり',
    reading: 'あかり',
    meaning: 'light; illumination',
    type: 'Noun',
  };

  const migrated = migrateCard(rawN3Item, 'N3 Vocab Core');
  assert.equal(migrated.content_type, 'vocab');
  assert.equal(migrated.jlpt_level, 'N3');
  assert.equal(migrated.meaning, 'light; illumination');
  assert.equal(migrated.ease_factor, 2.5);
  assert.equal(migrated.next_review_date > 0, true);
  assert.deepEqual(migrated.relationships, []);
});

test('migrateCard preserves existing intervals and reviews for in-progress cards', () => {
  const inProgressCard = {
    content_type: 'vocab',
    jlpt_level: 'N3',
    kanji: '悪魔',
    reading: 'あくま',
    meaning: 'devil; demon',
    interval: 12,
    repetitions: 4,
    ease_factor: 2.7,
    easeFactor: 2.7,
    next_review_date: 1800000000000,
    dueDate: 1800000000000,
    relationships: [{ card_id: 'c-1', relationship_type: 'uses_kanji' }],
  };

  const migrated = migrateCard(inProgressCard);
  assert.equal(migrated.interval, 12);
  assert.equal(migrated.repetitions, 4);
  assert.equal(migrated.ease_factor, 2.7);
  assert.equal(migrated.next_review_date, 1800000000000);
  assert.equal(migrated.relationships.length, 1);
  assert.equal(migrated.relationships[0].relationship_type, 'uses_kanji');
});

