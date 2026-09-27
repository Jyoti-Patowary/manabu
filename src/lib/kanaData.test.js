const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getAllKanaItems,
  generateKanaCards,
  calculateKanaMastery,
} = require('./kanaData.js');

test('getAllKanaItems returns exactly 104 kana sounds (46 Gojuon, 25 Dakuon, 33 Yoon)', () => {
  const all = getAllKanaItems();
  assert.equal(all.length, 104);

  const gojuon = all.filter((i) => i.section === 'gojuon');
  const dakuon = all.filter((i) => i.section === 'dakuon');
  const yoon = all.filter((i) => i.section === 'yoon');

  assert.equal(gojuon.length, 46);
  assert.equal(dakuon.length, 25);
  assert.equal(yoon.length, 33);
});

test('generateKanaCards produces cards conforming to unified schema with counterpart relationships', () => {
  const hiraganaCards = generateKanaCards({ scriptType: 'hiragana', section: 'gojuon' });
  const katakanaCards = generateKanaCards({ scriptType: 'katakana', section: 'gojuon' });

  assert.equal(hiraganaCards.length, 46);
  assert.equal(katakanaCards.length, 46);

  const firstH = hiraganaCards[0];
  assert.equal(firstH.content_type, 'kana');
  assert.equal(firstH.jlpt_level, null);
  assert.equal(firstH.character, 'あ');
  assert.equal(firstH.counterpart, 'ア');
  assert.equal(firstH.romaji, 'a');
  assert.equal(firstH.relationships.length, 1);
  assert.equal(firstH.relationships[0].relationship_type, 'counterpart');
  assert.equal(firstH.relationships[0].card_id, 'kana-a-katakana');

  const firstK = katakanaCards[0];
  assert.equal(firstK.content_type, 'kana');
  assert.equal(firstK.jlpt_level, null);
  assert.equal(firstK.character, 'ア');
  assert.equal(firstK.counterpart, 'あ');
  assert.equal(firstK.relationships[0].card_id, 'kana-a-hiragana');
});

test('calculateKanaMastery computes correct totals and percentages', () => {
  const cards = [
    { mastered: true },
    { repetitions: 3, interval: 4 },
    { repetitions: 0, interval: 0, mastered: false },
    { repetitions: 1, interval: 1, mastered: false },
  ];

  const stats = calculateKanaMastery(cards);
  assert.equal(stats.total, 4);
  assert.equal(stats.mastered, 2);
  assert.equal(stats.percentage, 50);
});

