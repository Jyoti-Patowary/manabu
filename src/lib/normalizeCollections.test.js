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
