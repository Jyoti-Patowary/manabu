const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCollectionsForClient, matchRecordId } = require('./normalizeCollections');

test('normalizeCollectionsForClient adds stable ids and study defaults to Mongo deck data', () => {
  const input = [
    {
      _id: 'col-1',
      name: 'Vocabs',
      description: 'Vocabulary',
      decks: [
        {
          _id: 'deck-1',
          name: 'N5 Vocabs',
          cards: [
            { meaning: 'person' },
            { _id: 'card-2', meaning: 'eat', repetitions: 1, dueDate: 123 }
          ]
        }
      ]
    }
  ];

  const result = normalizeCollectionsForClient(input);

  assert.equal(result[0].id, 'col-1');
  assert.equal(result[0].decks[0].id, 'deck-1');
  assert.equal(result[0].decks[0].cards[0].id.length > 0, true);
  assert.equal(result[0].decks[0].cards[0].dueDate > 0, true);
  assert.equal(result[0].decks[0].cards[0].repetitions, 0);
  assert.equal(result[0].decks[0].cards[1].id, 'card-2');
  assert.equal(result[0].decks[0].cards[1].repetitions, 1);
});

test('matchRecordId accepts either Mongo _id or normalized client id strings', () => {
  assert.equal(matchRecordId({ _id: '64d0d4e1a2b3c4d5e6f7a8b9' }, '64d0d4e1a2b3c4d5e6f7a8b9'), true);
  assert.equal(matchRecordId({ id: 'card-n5-kanji-item-37' }, 'card-n5-kanji-item-37'), true);
  assert.equal(matchRecordId({ _id: '64d0d4e1a2b3c4d5e6f7a8b9' }, 'card-n5-kanji-item-37'), false);
});

test('normalizeCardForClient normalizes legacy cards to unified schema with backward-compatible aliases', () => {
  const legacyKana = {
    type: 'hiragana',
    reading: 'あ',
    meaning: 'a',
    jlpt: 'N5',
    easeFactor: 2.6,
    dueDate: 500000,
  };

  const normalizedKana = normalizeCollectionsForClient([
    { name: 'Kana', decks: [{ name: 'Hiragana', cards: [legacyKana] }] }
  ])[0].decks[0].cards[0];

  assert.equal(normalizedKana.content_type, 'kana');
  assert.equal(normalizedKana.jlpt_level, null); // Kana has no JLPT level
  assert.equal(normalizedKana.ease_factor, 2.6);
  assert.equal(normalizedKana.easeFactor, 2.6);
  assert.equal(normalizedKana.next_review_date, 500000);
  assert.equal(normalizedKana.dueDate, 500000);
  assert.deepEqual(normalizedKana.relationships, []);
  assert.equal(normalizedKana.type, 'hiragana');

  const legacyN3Vocab = {
    type: 'vocab',
    kanji: '明かり',
    reading: 'あかり',
    meaning: 'light',
    jlpt: 'N3',
    easeFactor: 2.7,
    dueDate: 700000,
  };

  const normalizedVocab = normalizeCollectionsForClient([
    { name: 'N3 Vocab', decks: [{ name: 'N3 Deck', cards: [legacyN3Vocab] }] }
  ])[0].decks[0].cards[0];

  assert.equal(normalizedVocab.content_type, 'vocab');
  assert.equal(normalizedVocab.jlpt_level, 'N3');
  assert.equal(normalizedVocab.ease_factor, 2.7);
  assert.equal(normalizedVocab.easeFactor, 2.7);
  assert.equal(normalizedVocab.next_review_date, 700000);
  assert.equal(normalizedVocab.dueDate, 700000);
  assert.deepEqual(normalizedVocab.relationships, []);
});

test('normalizeCardForClient respects explicit unified content_type, jlpt_level, and relationships', () => {
  const unifiedGrammar = {
    content_type: 'grammar',
    jlpt_level: 'N2',
    relationships: [{ card_id: 'card-vocab-1', relationship_type: 'paired_grammar' }],
    grammar: '〜につれて',
    meaning: 'as... then...',
    ease_factor: 2.4,
    next_review_date: 888888,
  };

  const normalized = normalizeCollectionsForClient([
    { name: 'Grammar Col', decks: [{ name: 'N2 Grammar', cards: [unifiedGrammar] }] }
  ])[0].decks[0].cards[0];

  assert.equal(normalized.content_type, 'grammar');
  assert.equal(normalized.jlpt_level, 'N2');
  assert.equal(normalized.type, 'grammar');
  assert.equal(normalized.jlpt, 'N2');
  assert.equal(normalized.ease_factor, 2.4);
  assert.equal(normalized.easeFactor, 2.4);
  assert.equal(normalized.next_review_date, 888888);
  assert.equal(normalized.dueDate, 888888);
  assert.equal(normalized.relationships.length, 1);
  assert.equal(normalized.relationships[0].relationship_type, 'paired_grammar');
});

