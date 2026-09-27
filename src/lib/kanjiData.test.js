const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getKanjiByLevel,
  getAllKanji,
  createKanjiCard,
  generateKanjiDeck,
  searchKanji,
  KANJI_COUNT_BY_LEVEL,
} = require('./kanjiData.js');

test('getKanjiByLevel returns exact counts across all JLPT levels N5 through N1', () => {
  const n5 = getKanjiByLevel('N5');
  const n4 = getKanjiByLevel('N4');
  const n3 = getKanjiByLevel('N3');
  const n2 = getKanjiByLevel('N2');
  const n1 = getKanjiByLevel('N1');

  assert.equal(n5.length, KANJI_COUNT_BY_LEVEL.N5); // 73
  assert.equal(n4.length, KANJI_COUNT_BY_LEVEL.N4); // 151
  assert.equal(n3.length, KANJI_COUNT_BY_LEVEL.N3); // 341
  assert.equal(n2.length, KANJI_COUNT_BY_LEVEL.N2); // 345
  assert.equal(n1.length, KANJI_COUNT_BY_LEVEL.N1); // 1136

  const all = getAllKanji();
  assert.equal(all.length, 2046);
});

test('createKanjiCard builds unified schema cards with readings and stroke counts', () => {
  const sample = {
    kanji: '日',
    unicode: '65E5',
    meanings: ['day', 'sun', 'Japan'],
    on_readings: ['ニチ', 'ジツ'],
    kun_readings: ['ひ', '-び', '-か'],
    stroke_count: 4,
    heisig_en: 'day',
    grade: 1,
  };

  const card = createKanjiCard(sample, 'N5');

  assert.equal(card.content_type, 'kanji');
  assert.equal(card.jlpt_level, 'N5');
  assert.equal(card.kanji, '日');
  assert.equal(card.strokes, 4);
  assert.equal(card.stroke_count, 4);
  assert.equal(card.heisig_keyword, 'day');
  assert.equal(card.meaning.includes('day'), true);
  assert.equal(card.onyomi, 'ニチ、ジツ');
  assert.equal(card.kunyomi, 'ひ、-び、-か');
  assert.equal(card.ease_factor, 2.5);
  assert.equal(card.easeFactor, 2.5);
  assert.deepEqual(card.relationships, []);
});

test('generateKanjiDeck builds full deck array for N5', () => {
  const deck = generateKanjiDeck('N5');
  assert.equal(deck.length, 73);
  assert.equal(deck[0].content_type, 'kanji');
  assert.equal(deck[0].jlpt_level, 'N5');
});

test('searchKanji finds items by english meaning and kanji literal', () => {
  const byLiteral = searchKanji('一');
  assert.equal(byLiteral.length > 0, true);
  assert.equal(byLiteral[0].kanji, '一');

  const byMeaning = searchKanji('mountain');
  assert.equal(byMeaning.length > 0, true);
  assert.equal(byMeaning.some(k => k.kanji === '山'), true);
});

