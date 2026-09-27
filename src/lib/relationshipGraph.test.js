import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGraphForKanji,
  buildGraphForVocab,
  buildGraphForGrammar,
  buildRelationshipGraph,
  searchGraphNodes,
} from './relationshipGraph.js';

describe('relationshipGraph traversal engine', () => {
  it('builds a relationship graph centered on a Kanji character (食)', () => {
    const userCards = [
      { kanji: '食', interval: 14, repetitions: 3 },
      { kanji: '食べる', interval: 2, repetitions: 1 },
    ];

    const graph = buildGraphForKanji('食', userCards);

    assert.equal(graph.rootNode.type, 'kanji');
    assert.equal(graph.rootNode.label, '食');
    assert.equal(graph.rootNode.status, 'stable');
    assert.equal(graph.rootNode.isStable, true);

    // Should find connected vocabulary words containing 食
    assert.ok(graph.vocabNodes.length >= 1);
    assert.ok(graph.vocabNodes.some((v) => v.kanji.includes('食')));

    const taberu = graph.vocabNodes.find((v) => v.kanji === '食べる');
    if (taberu) {
      assert.equal(taberu.status, 'learning');
    }

    // Should find links
    assert.ok(graph.links.length >= 1);
    assert.ok(graph.links.some((l) => l.source === 'kanji-食'));
  });

  it('builds a relationship graph centered on a Vocabulary word (食べる)', () => {
    const graph = buildGraphForVocab('食べる');

    assert.equal(graph.rootNode.type, 'vocab');
    assert.equal(graph.rootNode.label, '食べる');

    // Should find constituent kanji 食
    assert.ok(graph.kanjiNodes.length >= 1);
    assert.ok(graph.kanjiNodes.some((k) => k.label === '食'));
  });

  it('builds a relationship graph centered on a Grammar point (ないといけない)', () => {
    const graph = buildGraphForGrammar('ないといけない');

    assert.equal(graph.rootNode.type, 'grammar');
    assert.equal(graph.rootNode.label, 'ないといけない');

    // Should find prerequisite vocab
    assert.ok(graph.vocabNodes.length >= 1);

    // Should find constituent kanji for those vocab words
    assert.ok(graph.kanjiNodes.length >= 1);
  });

  it('buildRelationshipGraph auto-resolves query type correctly', () => {
    const kanjiGraph = buildRelationshipGraph('飲');
    assert.equal(kanjiGraph.queryType, 'kanji');
    assert.equal(kanjiGraph.rootNode.label, '飲');

    const grammarGraph = buildRelationshipGraph('ないといけない');
    assert.equal(grammarGraph.queryType, 'grammar');
  });

  it('searches graph nodes across all three pillars', () => {
    const results = searchGraphNodes('eat');
    assert.ok(results.length >= 1);
    assert.ok(results.some((r) => r.label === '食' || r.label.includes('食べ')));
  });
});

