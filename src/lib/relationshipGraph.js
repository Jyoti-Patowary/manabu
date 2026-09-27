import kanjiRawData from '../../data/kanji_jlpt.json' with { type: 'json' };
import rawVocabData from '../../data/n5_vocab.json' with { type: 'json' };
import rawGrammarData from '../../data/n5_grammar.json' with { type: 'json' };
import { getPrerequisitesForGrammar } from './dependencyGraph.js';

// Index all Kanji across N5 through N1
const ALL_KANJI_LIST = [];
['N5', 'N4', 'N3', 'N2', 'N1'].forEach((lvl) => {
  const list = kanjiRawData[lvl] || [];
  list.forEach((k) => {
    ALL_KANJI_LIST.push({
      ...k,
      level: lvl,
    });
  });
});

const KANJI_MAP = new Map();
ALL_KANJI_LIST.forEach((k) => {
  if (k.kanji) KANJI_MAP.set(k.kanji, k);
});

const COMMON_FALLBACKS = [
  { kanji: '食', meanings: ['eat', 'food'], on_readings: ['ショク', 'ジキ'], kun_readings: ['た.べる', 'く.う'], level: 'N5', strokes: 9 },
  { kanji: '飲', meanings: ['drink'], on_readings: ['イン'], kun_readings: ['の.む'], level: 'N5', strokes: 12 },
];

COMMON_FALLBACKS.forEach((k) => {
  if (!KANJI_MAP.has(k.kanji)) {
    KANJI_MAP.set(k.kanji, k);
    ALL_KANJI_LIST.push(k);
  }
});

// Index all Vocabulary by kanji and reading
const VOCAB_MAP = new Map();
rawVocabData.forEach((v) => {
  if (v.kanji) VOCAB_MAP.set(v.kanji, v);
  if (v.reading && !VOCAB_MAP.has(v.reading)) VOCAB_MAP.set(v.reading, v);
});

// Index all Grammar
const GRAMMAR_MAP = new Map();
rawGrammarData.forEach((g) => {
  if (g.grammar) GRAMMAR_MAP.set(g.grammar, g);
});

/**
 * Derives user SRS status for a node given user cards
 */
function resolveSrsStatus(itemIdentifier, userCards = []) {
  if (!userCards || userCards.length === 0) {
    return { status: 'unstudied', interval: 0, repetitions: 0, isStable: false };
  }

  const match = userCards.find((c) => {
    return (
      c.kanji === itemIdentifier ||
      c.grammar === itemIdentifier ||
      c.reading === itemIdentifier ||
      c.id === itemIdentifier ||
      c._id === itemIdentifier
    );
  });

  if (!match) {
    return { status: 'unstudied', interval: 0, repetitions: 0, isStable: false };
  }

  const interval = match.interval || 0;
  const repetitions = match.repetitions || 0;
  const isStable = interval >= 7;
  const status = isStable ? 'stable' : (repetitions > 0 || interval > 0 ? 'learning' : 'unstudied');

  return { status, interval, repetitions, isStable };
}

/**
 * Builds relationship network centered around a Kanji character
 */
export function buildGraphForKanji(kanjiChar, userCards = []) {
  const kanjiInfo = KANJI_MAP.get(kanjiChar) || {
    kanji: kanjiChar,
    meanings: [],
    on_readings: [],
    kun_readings: [],
    level: 'N5',
  };

  const rootSrs = resolveSrsStatus(kanjiChar, userCards);
  const rootNode = {
    id: `kanji-${kanjiChar}`,
    type: 'kanji',
    label: kanjiChar,
    kanji: kanjiChar,
    readings: [
      ...(kanjiInfo.on_readings || []),
      ...(kanjiInfo.kun_readings || []),
    ].join('、'),
    onyomi: (kanjiInfo.on_readings || []).join('、'),
    kunyomi: (kanjiInfo.kun_readings || []).join('、'),
    meaning: Array.isArray(kanjiInfo.meanings) ? kanjiInfo.meanings.join(', ') : (kanjiInfo.meaning || ''),
    level: kanjiInfo.level || 'N5',
    strokes: kanjiInfo.strokes || 0,
    ...rootSrs,
  };

  // 1. Find all vocabulary words containing this Kanji
  const vocabNodes = [];
  const links = [];
  const seenVocab = new Set();

  for (const v of rawVocabData) {
    if (v.kanji && v.kanji.includes(kanjiChar)) {
      if (seenVocab.has(v.kanji)) continue;
      seenVocab.add(v.kanji);

      const vSrs = resolveSrsStatus(v.kanji, userCards);
      const vId = `vocab-${v.kanji}`;
      const vNode = {
        id: vId,
        type: 'vocab',
        label: v.kanji,
        kanji: v.kanji,
        reading: v.reading || '',
        meaning: v.meaning || '',
        partOfSpeech: v.partOfSpeech || '',
        level: v.jlpt || 'N5',
        example: v.example || '',
        exampleMeaning: v.exampleMeaning || '',
        ...vSrs,
      };
      vocabNodes.push(vNode);

      links.push({
        source: rootNode.id,
        target: vId,
        relationship: 'contains_kanji',
      });

      if (vocabNodes.length >= 8) break; // Keep visualization focused and performant
    }
  }

  // 2. Find Grammar points connecting to these vocabulary words
  const grammarNodes = [];
  const seenGrammar = new Set();

  for (const g of rawGrammarData) {
    const prereqs = getPrerequisitesForGrammar(g);
    for (const vNode of vocabNodes) {
      const isLinked = prereqs.some((p) => p.kanji === vNode.kanji || p.word === vNode.kanji);
      if (isLinked) {
        const gId = `grammar-${g.grammar}`;
        if (!seenGrammar.has(g.grammar)) {
          seenGrammar.add(g.grammar);
          const gSrs = resolveSrsStatus(g.grammar, userCards);
          grammarNodes.push({
            id: gId,
            type: 'grammar',
            label: g.grammar,
            grammar: g.grammar,
            meaning: g.meaning || '',
            formation: g.formation || '',
            usage: g.usage || '',
            level: g.jlpt || 'N5',
            example: g.example || (g.grammarExamples?.[0]?.japanese || ''),
            exampleMeaning: g.exampleMeaning || (g.grammarExamples?.[0]?.english || ''),
            ...gSrs,
          });
        }

        links.push({
          source: vNode.id,
          target: gId,
          relationship: 'used_in_grammar',
        });
      }
    }

    if (grammarNodes.length >= 8) break;
  }

  return {
    rootNode,
    vocabNodes,
    grammarNodes,
    links,
    totalNodes: 1 + vocabNodes.length + grammarNodes.length,
  };
}

/**
 * Builds relationship network centered around a Vocabulary word
 */
export function buildGraphForVocab(vocabWord, userCards = []) {
  const vocabInfo = VOCAB_MAP.get(vocabWord) || {
    kanji: vocabWord,
    reading: vocabWord,
    meaning: '',
    jlpt: 'N5',
  };

  const rootSrs = resolveSrsStatus(vocabWord, userCards);
  const rootNode = {
    id: `vocab-${vocabWord}`,
    type: 'vocab',
    label: vocabInfo.kanji || vocabWord,
    kanji: vocabInfo.kanji || vocabWord,
    reading: vocabInfo.reading || '',
    meaning: vocabInfo.meaning || '',
    level: vocabInfo.jlpt || 'N5',
    ...rootSrs,
  };

  // 1. Constituent Kanji
  const kanjiChars = (vocabInfo.kanji || '')
    .split('')
    .filter((char) => /[\u4E00-\u9FAF]/.test(char));

  const kanjiNodes = [];
  const links = [];

  for (const kChar of kanjiChars) {
    const kInfo = KANJI_MAP.get(kChar) || { kanji: kChar, meanings: [], level: 'N5' };
    const kSrs = resolveSrsStatus(kChar, userCards);
    const kId = `kanji-${kChar}`;
    kanjiNodes.push({
      id: kId,
      type: 'kanji',
      label: kChar,
      kanji: kChar,
      meaning: Array.isArray(kInfo.meanings) ? kInfo.meanings.join(', ') : (kInfo.meaning || ''),
      readings: [...(kInfo.on_readings || []), ...(kInfo.kun_readings || [])].join('、'),
      level: kInfo.level || 'N5',
      ...kSrs,
    });

    links.push({
      source: kId,
      target: rootNode.id,
      relationship: 'contains_kanji',
    });
  }

  // 2. Dependent Grammar Points
  const grammarNodes = [];
  for (const g of rawGrammarData) {
    const prereqs = getPrerequisitesForGrammar(g);
    if (prereqs.some((p) => p.kanji === vocabWord || p.word === vocabWord)) {
      const gSrs = resolveSrsStatus(g.grammar, userCards);
      const gId = `grammar-${g.grammar}`;
      grammarNodes.push({
        id: gId,
        type: 'grammar',
        label: g.grammar,
        grammar: g.grammar,
        meaning: g.meaning || '',
        formation: g.formation || '',
        level: g.jlpt || 'N5',
        example: g.example || (g.grammarExamples?.[0]?.japanese || ''),
        ...gSrs,
      });

      links.push({
        source: rootNode.id,
        target: gId,
        relationship: 'used_in_grammar',
      });
    }
  }

  return {
    rootNode,
    kanjiNodes,
    grammarNodes,
    links,
    totalNodes: 1 + kanjiNodes.length + grammarNodes.length,
  };
}

/**
 * Builds relationship network centered around a Grammar point
 */
export function buildGraphForGrammar(grammarPattern, userCards = []) {
  const gInfo = GRAMMAR_MAP.get(grammarPattern) || {
    grammar: grammarPattern,
    meaning: '',
    formation: '',
    jlpt: 'N5',
  };

  const rootSrs = resolveSrsStatus(grammarPattern, userCards);
  const rootNode = {
    id: `grammar-${grammarPattern}`,
    type: 'grammar',
    label: grammarPattern,
    grammar: grammarPattern,
    meaning: gInfo.meaning || '',
    formation: gInfo.formation || '',
    level: gInfo.jlpt || 'N5',
    ...rootSrs,
  };

  const prereqs = getPrerequisitesForGrammar(gInfo);
  const vocabNodes = [];
  const kanjiNodes = [];
  const links = [];
  const seenKanji = new Set();

  for (const p of prereqs) {
    const vSrs = resolveSrsStatus(p.kanji, userCards);
    const vId = `vocab-${p.kanji}`;
    vocabNodes.push({
      id: vId,
      type: 'vocab',
      label: p.kanji,
      kanji: p.kanji,
      reading: p.reading,
      meaning: p.meaning,
      level: 'N5',
      ...vSrs,
    });

    links.push({
      source: vId,
      target: rootNode.id,
      relationship: 'used_in_grammar',
    });

    // Extract kanji from vocab
    const chars = (p.kanji || '').split('').filter((c) => /[\u4E00-\u9FAF]/.test(c));
    for (const c of chars) {
      if (!seenKanji.has(c)) {
        seenKanji.add(c);
        const kInfo = KANJI_MAP.get(c) || { kanji: c, meanings: [], level: 'N5' };
        const kSrs = resolveSrsStatus(c, userCards);
        const kId = `kanji-${c}`;
        kanjiNodes.push({
          id: kId,
          type: 'kanji',
          label: c,
          kanji: c,
          meaning: Array.isArray(kInfo.meanings) ? kInfo.meanings.join(', ') : (kInfo.meaning || ''),
          readings: [...(kInfo.on_readings || []), ...(kInfo.kun_readings || [])].join('、'),
          level: kInfo.level || 'N5',
          ...kSrs,
        });

        links.push({
          source: kId,
          target: vId,
          relationship: 'contains_kanji',
        });
      }
    }
  }

  return {
    rootNode,
    vocabNodes,
    kanjiNodes,
    links,
    totalNodes: 1 + vocabNodes.length + kanjiNodes.length,
  };
}

/**
 * Universal graph builder supporting any query or character
 */
export function buildRelationshipGraph(queryOrChar = '食', userCards = []) {
  const q = String(queryOrChar).trim();

  // If single kanji
  if (q.length === 1 && /[\u4E00-\u9FAF]/.test(q)) {
    return { ...buildGraphForKanji(q, userCards), queryType: 'kanji' };
  }

  // If matches grammar
  if (GRAMMAR_MAP.has(q) || q.startsWith('〜') || q.startsWith('～')) {
    const cleanG = q.replace(/^[〜～]/, '');
    const matched = rawGrammarData.find((g) => g.grammar.includes(cleanG));
    if (matched) {
      return { ...buildGraphForGrammar(matched.grammar, userCards), queryType: 'grammar' };
    }
  }

  // Check vocab
  if (VOCAB_MAP.has(q)) {
    return { ...buildGraphForVocab(q, userCards), queryType: 'vocab' };
  }

  // Default fallback: kanji graph
  return { ...buildGraphForKanji('食', userCards), queryType: 'kanji' };
}

/**
 * Search across Kanji, Vocab, and Grammar to suggest graph root candidates
 */
export function searchGraphNodes(query = '') {
  if (!query || !query.trim()) {
    return [
      { type: 'kanji', label: '食', meaning: 'eat, food', level: 'N5' },
      { type: 'kanji', label: '行', meaning: 'go, act', level: 'N5' },
      { type: 'kanji', label: '見', meaning: 'see, look', level: 'N5' },
      { type: 'kanji', label: '飲', meaning: 'drink', level: 'N5' },
      { type: 'kanji', label: '勉', meaning: 'exertion, study', level: 'N4' },
      { type: 'kanji', label: '生', meaning: 'life, birth', level: 'N5' },
      { type: 'kanji', label: '話', meaning: 'talk, speak', level: 'N5' },
    ];
  }

  const q = query.trim().toLowerCase();
  const wordRegex = new RegExp(`(^|[\\s,;/-])${q}([\\s,;/-]|$)`, 'i');
  const results = [];

  // 1. Exact or word-boundary matches in Kanji
  for (const k of ALL_KANJI_LIST) {
    const meaning = Array.isArray(k.meanings) ? k.meanings.join(', ') : (k.meaning || '');
    if (k.kanji === q || wordRegex.test(meaning) || meaning.toLowerCase() === q) {
      results.push({
        type: 'kanji',
        label: k.kanji,
        meaning,
        level: k.level || 'N5',
      });
      if (results.length >= 4) break;
    }
  }

  // 2. Vocab matches
  for (const v of rawVocabData) {
    if (
      (v.kanji && (v.kanji === q || v.kanji.includes(q))) ||
      (v.reading && (v.reading === q || v.reading.includes(q))) ||
      (v.meaning && (wordRegex.test(v.meaning) || v.meaning.toLowerCase().includes(q)))
    ) {
      results.push({
        type: 'vocab',
        label: v.kanji || v.reading,
        meaning: v.meaning,
        reading: v.reading,
        level: v.jlpt || 'N5',
      });
      if (results.length >= 8) break;
    }
  }

  // 3. Grammar matches
  for (const g of rawGrammarData) {
    if (
      (g.grammar && g.grammar.includes(q)) ||
      (g.meaning && (wordRegex.test(g.meaning) || g.meaning.toLowerCase().includes(q)))
    ) {
      results.push({
        type: 'grammar',
        label: g.grammar,
        meaning: g.meaning,
        level: g.jlpt || 'N5',
      });
      if (results.length >= 12) break;
    }
  }

  return results;
}
