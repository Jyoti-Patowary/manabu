import test from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultCollections } from './defaultCollections.js';

test('defaultCollections engine loads complete multi-pillar fallback collections', () => {
  const collections = getDefaultCollections();
  assert.ok(Array.isArray(collections), 'Collections should be an array');
  assert.ok(collections.length >= 5, 'Should have at least 5 collections (Kana, N5, N4, N3, Advanced)');

  const n5Col = collections.find(c => c.id === 'collection-jlpt-n5');
  assert.ok(n5Col, 'Should contain JLPT N5 collection');
  assert.equal(n5Col.decks.length, 3, 'N5 should have 3 decks (Vocab, Kanji, Grammar)');

  const vocabDeck = n5Col.decks.find(d => d.id === 'deck-n5-vocab');
  assert.ok(vocabDeck && vocabDeck.cards.length >= 100, 'N5 vocab deck should have >= 100 cards');

  const firstVocab = vocabDeck.cards[0];
  assert.ok(firstVocab.reading, 'Vocab card should have reading');
  assert.ok(firstVocab.meaning, 'Vocab card should have meaning');
  assert.equal(firstVocab.content_type, 'vocab');
  assert.equal(firstVocab.jlpt_level, 'N5');

  const kanjiDeck = n5Col.decks.find(d => d.id === 'deck-n5-kanji');
  assert.ok(kanjiDeck && kanjiDeck.cards.length === 73, 'N5 kanji deck should have 73 cards');

  const grammarDeck = n5Col.decks.find(d => d.id === 'deck-n5-grammar');
  assert.ok(grammarDeck && grammarDeck.cards.length > 0, 'N5 grammar deck should have cards');

  const kanaCol = collections.find(c => c.id === 'collection-kana');
  assert.ok(kanaCol, 'Should contain Kana collection');
  assert.equal(kanaCol.decks.length, 2, 'Kana should have Hiragana and Katakana decks');

  // Assert N4, N3, N2, and N1 vocabulary decks
  const n4Col = collections.find(c => c.id === 'collection-jlpt-n4');
  assert.ok(n4Col, 'Should contain JLPT N4 collection');
  const n4Vocab = n4Col.decks.find(d => d.id === 'deck-n4-vocab');
  assert.ok(n4Vocab && n4Vocab.cards.length === 668, 'N4 vocab should have 668 cards');

  const n3Col = collections.find(c => c.id === 'collection-jlpt-n3');
  assert.ok(n3Col, 'Should contain JLPT N3 collection');
  const n3Vocab = n3Col.decks.find(d => d.id === 'deck-n3-vocab');
  assert.ok(n3Vocab && n3Vocab.cards.length === 2139, 'N3 vocab should have 2139 cards');

  const n2Col = collections.find(c => c.id === 'collection-jlpt-n2');
  assert.ok(n2Col, 'Should contain JLPT N2 collection');
  const n2Vocab = n2Col.decks.find(d => d.id === 'deck-n2-vocab');
  assert.ok(n2Vocab && n2Vocab.cards.length === 1748, 'N2 vocab should have 1748 cards');

  const n1Col = collections.find(c => c.id === 'collection-jlpt-n1');
  assert.ok(n1Col, 'Should contain JLPT N1 collection');
  const n1Vocab = n1Col.decks.find(d => d.id === 'deck-n1-vocab');
  assert.ok(n1Vocab && n1Vocab.cards.length === 2699, 'N1 vocab should have 2699 cards');

  // Verify due cards exist for immediate day-1 study experience
  const allCards = collections.flatMap(c => c.decks.flatMap(d => d.cards));
  const dueCards = allCards.filter(c => c.dueDate <= Date.now() && c.repetitions > 0);
  assert.ok(dueCards.length > 0, 'Should have cards initially due for review');
});

