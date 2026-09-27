import rawGrammarData from '../../data/n5_grammar.json' with { type: 'json' };

export const JLPT_GRAMMAR_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * Returns all grammar points available in the dataset.
 */
export function getAllGrammar() {
  return rawGrammarData.map((item) => ({
    ...item,
    jlpt: (item.jlpt || 'N5').toUpperCase().replace(/[^A-Z0-9]/g, '') === 'N4' ? 'N4' : 'N5',
  }));
}

/**
 * Returns grammar points filtered by JLPT level.
 */
export function getGrammarByLevel(level = 'N5') {
  const normLevel = String(level).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const targetLevel = normLevel.includes('4') ? 'N4' : 'N5';
  return getAllGrammar().filter((item) => item.jlpt === targetLevel);
}

/**
 * Generates a clean URL / ID safe slug from grammar pattern string
 */
export function createGrammarSlug(pattern = '') {
  return pattern
    .replace(/^〜|～/, '')
    .trim()
    .replace(/[\s\/\(\)]+/g, '-')
    .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, '')
    .slice(0, 40) || 'point';
}

/**
 * Creates a contextual cloze test sentence from grammar point and its examples.
 * Blanks out the target grammar pattern (e.g., 【＿＿＿＿】).
 */
export function generateClozePrompt(grammarItem) {
  if (!grammarItem) return null;

  const rawPattern = (grammarItem.grammar || '').replace(/^〜|～/, '').trim();
  const examples = [
    ...(grammarItem.grammarExamples || []),
    grammarItem.example ? { japanese: grammarItem.example, reading: grammarItem.exampleReading, english: grammarItem.exampleMeaning } : null,
  ].filter(Boolean);

  if (examples.length === 0) {
    return {
      clozeSentence: `【＿＿＿＿】`,
      targetPattern: grammarItem.grammar,
      hintSentence: grammarItem.meaning,
      english: grammarItem.meaning,
    };
  }

  // Try to find an example containing the raw pattern or its core stem
  const coreStem = rawPattern.slice(0, Math.max(2, Math.floor(rawPattern.length * 0.7)));

  for (const ex of examples) {
    const jp = ex.japanese || '';
    if (!jp) continue;

    if (jp.includes(rawPattern)) {
      return {
        clozeSentence: jp.replace(rawPattern, '【＿＿＿＿】'),
        targetPattern: grammarItem.grammar,
        hintSentence: ex.reading || '',
        english: ex.english || grammarItem.meaning,
        fullJapanese: jp,
      };
    }

    if (coreStem && jp.includes(coreStem)) {
      // Mask from core stem to end of clause/sentence or next punctuation
      const regex = new RegExp(`${coreStem}[\\u3040-\\u309F\\u30A0-\\u30FF]*`);
      return {
        clozeSentence: jp.replace(regex, '【＿＿＿＿】'),
        targetPattern: grammarItem.grammar,
        hintSentence: ex.reading || '',
        english: ex.english || grammarItem.meaning,
        fullJapanese: jp,
      };
    }
  }

  // Fallback: use first example and append blank
  const primaryEx = examples[0];
  return {
    clozeSentence: `${primaryEx.japanese} (使用文法: 【＿＿＿＿】)`,
    targetPattern: grammarItem.grammar,
    hintSentence: primaryEx.reading || '',
    english: primaryEx.english || grammarItem.meaning,
    fullJapanese: primaryEx.japanese,
  };
}

/**
 * Normalizes a raw grammar item into a unified content_type: 'grammar' Card
 */
export function createGrammarCard(item, level = null) {
  const resolvedLevel = (level || item.jlpt || 'N5').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const targetLevel = resolvedLevel.includes('4') ? 'N4' : 'N5';
  const slug = createGrammarSlug(item.grammar || item.meaning);
  const cardId = `grammar-${targetLevel.toLowerCase()}-${slug}`;

  return {
    _id: cardId,
    id: cardId,
    content_type: 'grammar',
    jlpt_level: targetLevel,
    type: 'grammar',
    jlpt: targetLevel,
    category: item.category || 'Grammar',
    grammar: item.grammar || '',
    meaning: item.meaning || '',
    formation: item.formation || '',
    usage: item.usage || '',
    tags: Array.isArray(item.tags) ? item.tags : [targetLevel, 'grammar', item.category || ''].filter(Boolean),
    example: item.example || '',
    exampleReading: item.exampleReading || '',
    exampleMeaning: item.exampleMeaning || '',
    grammarExamples: Array.isArray(item.grammarExamples) ? item.grammarExamples : [],
    commonMistake: item.commonMistake || '',
    formalAlternative: item.formalAlternative || '',
    negative: item.negative || '',
    past: item.past || '',
    pastNegative: item.pastNegative || '',
    interval: typeof item.interval === 'number' ? item.interval : 0,
    repetitions: typeof item.repetitions === 'number' ? item.repetitions : 0,
    ease_factor: typeof item.ease_factor === 'number' ? item.ease_factor : (item.easeFactor || 2.5),
    easeFactor: typeof item.easeFactor === 'number' ? item.easeFactor : 2.5,
    next_review_date: item.next_review_date || item.dueDate || Date.now(),
    dueDate: item.dueDate || item.next_review_date || Date.now(),
    relationships: Array.isArray(item.relationships) ? item.relationships : [],
  };
}

/**
 * Generates an SRS deck of grammar cards for a specific level.
 */
export function generateGrammarDeck(level = 'N5', options = {}) {
  const points = getGrammarByLevel(level);
  const cards = points.map((p) => createGrammarCard(p, level));

  const limit = options.limit || cards.length;
  const selectedCards = cards.slice(0, limit);

  return {
    _id: `deck-grammar-${level.toLowerCase()}`,
    id: `deck-grammar-${level.toLowerCase()}`,
    name: `JLPT ${level.toUpperCase()} Grammar (文法)`,
    category: `JLPT ${level.toUpperCase()}`,
    content_type: 'grammar',
    cards: selectedCards,
  };
}

/**
 * Searches grammar points by query, level, and category.
 */
export function searchGrammar(query = '', level = 'all', category = 'all') {
  let list = getAllGrammar();

  if (level && level !== 'all') {
    const norm = level.toUpperCase().replace(/[^A-Z0-9]/g, '');
    list = list.filter((item) => item.jlpt === norm);
  }

  if (category && category !== 'all') {
    list = list.filter((item) => (item.category || '').toLowerCase() === category.toLowerCase());
  }

  if (!query || !query.trim()) {
    return list;
  }

  const q = query.trim().toLowerCase();
  return list.filter((item) => {
    return (
      (item.grammar && item.grammar.toLowerCase().includes(q)) ||
      (item.meaning && item.meaning.toLowerCase().includes(q)) ||
      (item.formation && item.formation.toLowerCase().includes(q)) ||
      (item.usage && item.usage.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.example && item.example.toLowerCase().includes(q))
    );
  });
}

