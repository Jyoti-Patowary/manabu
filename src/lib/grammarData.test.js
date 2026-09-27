import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllGrammar,
  getGrammarByLevel,
  createGrammarCard,
  generateClozePrompt,
  generateGrammarDeck,
  searchGrammar,
} from './grammarData.js';

describe('grammarData library', () => {
  it('loads all grammar points from dataset', () => {
    const all = getAllGrammar();
    assert.equal(all.length, 188);
  });

  it('filters grammar points by JLPT level correctly', () => {
    const n5 = getGrammarByLevel('N5');
    const n4 = getGrammarByLevel('N4');
    assert.equal(n5.length, 169);
    assert.equal(n4.length, 19);
    assert.equal(n5.every((item) => item.jlpt === 'N5'), true);
    assert.equal(n4.every((item) => item.jlpt === 'N4'), true);
  });

  it('normalizes a raw grammar item into a unified content_type: grammar card', () => {
    const sample = getGrammarByLevel('N4')[0];
    const card = createGrammarCard(sample, 'N4');

    assert.equal(card.content_type, 'grammar');
    assert.equal(card.jlpt_level, 'N4');
    assert.equal(card.type, 'grammar');
    assert.equal(typeof card.grammar, 'string');
    assert.ok(card.grammar.length > 0);
    assert.ok(card.formation.length > 0);
    assert.equal(card.ease_factor, 2.5);
    assert.equal(card.interval, 0);
    assert.equal(card.repetitions, 0);
    assert.ok(card.id.startsWith('grammar-n4-'));
    assert.ok(Array.isArray(card.grammarExamples));
  });

  it('generates a cloze prompt masking the target pattern', () => {
    const sample = {
      grammar: 'ないといけない',
      meaning: 'must do',
      grammarExamples: [
        {
          japanese: '薬を飲まないといけません。',
          reading: 'Kusuri o nomanai to ikemasen.',
          english: 'I have to take medicine.',
        },
      ],
    };

    const cloze = generateClozePrompt(sample);
    assert.ok(cloze !== null);
    assert.ok(cloze.clozeSentence.includes('【＿＿＿＿】'));
    assert.equal(cloze.targetPattern, 'ないといけない');
    assert.ok(cloze.english.length > 0);
  });

  it('generates a complete grammar deck', () => {
    const deck = generateGrammarDeck('N5', { limit: 10 });
    assert.equal(deck.name, 'JLPT N5 Grammar (文法)');
    assert.equal(deck.content_type, 'grammar');
    assert.equal(deck.cards.length, 10);
    assert.equal(deck.cards[0].content_type, 'grammar');
  });

  it('searches grammar points by query, level, and category', () => {
    const results = searchGrammar('ないといけない');
    assert.ok(results.length >= 1);
    assert.equal(results[0].grammar, 'ないといけない');

    const obligationN4 = searchGrammar('', 'N4', 'Obligation');
    assert.ok(obligationN4.length >= 1);
    assert.equal(obligationN4[0].jlpt, 'N4');
  });
});

