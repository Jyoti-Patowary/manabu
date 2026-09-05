const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDeckCollections } = require('./groupDeckCollections');

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
