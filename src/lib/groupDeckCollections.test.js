const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDeckCollections, normalizeJlpt, groupGrammarByJlpt } = require('./groupDeckCollections');

test('buildDeckCollections groups decks into Hiragana, Katakana, Vocabs, Grammar, and Kanji folders', () => {
  const rawDecks = [
    { _id: '1', name: 'Hiragana Basics', cards: [{ type: 'hiragana', reading: 'あ', meaning: 'a' }] },
    { _id: '2', name: 'Katakana Basics', cards: [{ type: 'katakana', reading: 'ア', meaning: 'a' }] },
    { _id: '3', name: 'People Vocabs', cards: [{ type: 'vocab', meaning: 'person' }] },
    { _id: '4', name: 'Daily Life Vocabs', cards: [{ type: 'vocab', meaning: 'eat' }] },
    { _id: '5', name: 'N5 Grammar', cards: [{ type: 'grammar', meaning: 'particle' }] },
    { _id: '6', name: 'N4 Kanji', cards: [{ type: 'kanji', meaning: 'day' }] },
  ];

  const collections = buildDeckCollections(rawDecks);

  assert.deepEqual(
    collections.map((collection) => collection.name),
    ['Hiragana', 'Katakana', 'Vocabs', 'Grammar', 'Kanji']
  );

  assert.deepEqual(
    collections[0].decks.map((deck) => deck.name),
    ['Hiragana Basics']
  );

  assert.deepEqual(
    collections[1].decks.map((deck) => deck.name),
    ['Katakana Basics']
  );

  assert.deepEqual(
    collections[2].decks.map((deck) => deck.name),
    ['People Vocabs', 'Daily Life Vocabs']
  );

  assert.deepEqual(
    collections[3].decks.map((deck) => deck.name),
    ['N5 Grammar']
  );

  assert.deepEqual(
    collections[4].decks.map((deck) => deck.name),
    ['N4 Kanji']
  );
});

test('normalizeJlpt resolves both N5 and JLPT_N5 values for grammar grouping', () => {
  assert.equal(normalizeJlpt('N5'), 'N5');
  assert.equal(normalizeJlpt('JLPT_N5'), 'N5');
  assert.equal(normalizeJlpt('jlpt_n4'), 'N4');
  assert.equal(normalizeJlpt(''), '');
});

test('groupGrammarByJlpt groups grammar decks by level', () => {
  const decks = [
    { id: 'deck-1', name: 'N5 Grammar', cards: [{ type: 'grammar', jlpt: 'JLPT_N5' }] },
    { id: 'deck-2', name: 'N4 Grammar', cards: [{ type: 'grammar', jlpt: 'N4' }] },
    { id: 'deck-3', name: 'Random Deck', cards: [{ type: 'vocab', jlpt: 'N2' }] },
  ];

  assert.deepEqual(groupGrammarByJlpt(decks), [
    { level: 'N5', decks: [decks[0]] },
    { level: 'N4', decks: [decks[1]] },
  ]);
});
