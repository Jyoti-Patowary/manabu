import rawVocabData from '../../data/n5_vocab.json' with { type: 'json' };
import rawGrammarData from '../../data/n5_grammar.json' with { type: 'json' };

export const STABLE_INTERVAL_DAYS = 7;

// Pre-filter candidate content words from vocabulary (length >= 2, or meaningful 1-kanji nouns/verbs)
const IGNORED_GENERIC = new Set(['私', 'あなた', 'これ', 'それ', 'あれ', '何', '学生', 'さん']);

const CANDIDATE_VOCAB = rawVocabData
  .filter((v) => v.kanji && v.kanji.length >= 1 && !IGNORED_GENERIC.has(v.kanji))
  .sort((a, b) => (b.kanji?.length || 0) - (a.kanji?.length || 0));

// Memory cache for prerequisite mappings
const PREREQUISITE_CACHE = new Map();

/**
 * Returns curated prerequisite vocabulary words for a given grammar item.
 */
export function getPrerequisitesForGrammar(grammarItem) {
  if (!grammarItem) return [];

  const key = grammarItem.grammar || grammarItem.meaning || grammarItem.id;
  if (PREREQUISITE_CACHE.has(key)) {
    return PREREQUISITE_CACHE.get(key);
  }

  // 1. Check explicit relationships if provided
  if (Array.isArray(grammarItem.relationships) && grammarItem.relationships.length > 0) {
    const explicit = grammarItem.relationships
      .filter((r) => r.relationship_type === 'prerequisite')
      .map((r) => {
        const found = rawVocabData.find((v) => v.kanji === r.card_id || v.id === r.card_id);
        return found ? {
          word: found.kanji || found.reading,
          kanji: found.kanji || '',
          reading: found.reading || '',
          meaning: found.meaning || '',
          partOfSpeech: found.partOfSpeech || '',
        } : {
          word: r.card_id,
          kanji: r.card_id,
          reading: '',
          meaning: '',
        };
      });

    if (explicit.length > 0) {
      PREREQUISITE_CACHE.set(key, explicit);
      return explicit;
    }
  }

  // 2. Derive prerequisite vocabulary from example sentences
  const corpus = [
    grammarItem.example || '',
    ...(grammarItem.grammarExamples || []).map((e) => e.japanese || ''),
  ].join(' ');

  const matched = [];
  const seenWords = new Set();

  for (const vocab of CANDIDATE_VOCAB) {
    const word = vocab.kanji;
    if (!word || seenWords.has(word)) continue;

    if (corpus.includes(word)) {
      // Avoid adding shorter sub-tokens if a longer compound already exists
      const isSub = matched.some((m) => m.kanji.includes(word) && m.kanji !== word);
      if (!isSub) {
        matched.push({
          word,
          kanji: vocab.kanji,
          reading: vocab.reading,
          meaning: vocab.meaning,
          partOfSpeech: vocab.partOfSpeech || '',
        });
        seenWords.add(word);
      }
    }

    if (matched.length >= 4) break;
  }

  // If no examples matched (rare edge-case), assign standard foundation verbs
  if (matched.length === 0) {
    const fallback = CANDIDATE_VOCAB.slice(0, 2).map((v) => ({
      word: v.kanji,
      kanji: v.kanji,
      reading: v.reading,
      meaning: v.meaning,
      partOfSpeech: v.partOfSpeech || '',
    }));
    PREREQUISITE_CACHE.set(key, fallback);
    return fallback;
  }

  PREREQUISITE_CACHE.set(key, matched);
  return matched;
}

/**
 * Evaluates the lock and readiness status of a grammar card against the user's studied vocab cards.
 *
 * @param {Object} grammarCard
 * @param {Array} userVocabCards Array of vocab cards with { kanji, reading, interval, repetitions }
 * @param {number} thresholdDays Minimum interval required for a prerequisite to be stable (default 7)
 */
export function evaluateGrammarLockStatus(grammarCard, userVocabCards = [], thresholdDays = STABLE_INTERVAL_DAYS) {
  const prerequisites = getPrerequisitesForGrammar(grammarCard);

  if (prerequisites.length === 0) {
    return {
      isUnlocked: true,
      readinessPercent: 100,
      stableCount: 0,
      totalCount: 0,
      prerequisites: [],
      thresholdDays,
    };
  }

  // Build lookup index of user's studied vocabulary
  const userVocabMap = new Map();
  (userVocabCards || []).forEach((c) => {
    if (c.kanji) userVocabMap.set(c.kanji, c);
    if (c.reading) userVocabMap.set(c.reading, c);
  });

  let stableCount = 0;

  const evaluatedPrereqs = prerequisites.map((prereq) => {
    const userCard = userVocabMap.get(prereq.kanji) || userVocabMap.get(prereq.reading);
    const currentInterval = userCard?.interval || 0;
    const repetitions = userCard?.repetitions || 0;
    const isStable = currentInterval >= thresholdDays;

    if (isStable) {
      stableCount++;
    }

    let status = 'unstudied';
    if (isStable) {
      status = 'stable';
    } else if (repetitions > 0 || currentInterval > 0) {
      status = 'learning';
    }

    return {
      ...prereq,
      currentInterval,
      requiredInterval: thresholdDays,
      repetitions,
      isStable,
      status, // 'stable' | 'learning' | 'unstudied'
    };
  });

  const totalCount = evaluatedPrereqs.length;
  const isUnlocked = stableCount === totalCount;
  const readinessPercent = Math.round((stableCount / totalCount) * 100);

  return {
    isUnlocked,
    readinessPercent,
    stableCount,
    totalCount,
    prerequisites: evaluatedPrereqs,
    thresholdDays,
  };
}

/**
 * Filters and orders study queue based on dependency unlock status.
 *
 * In 'strict' mode, locked grammar cards are withheld or deferred until prerequisites are satisfied.
 * In 'open' mode, cards remain accessible but are annotated with dependency status.
 */
export function filterQueueByDependencies(cards = [], userVocabCards = [], options = {}) {
  const mode = options.mode || 'strict'; // 'strict' | 'open'
  const thresholdDays = options.thresholdDays || STABLE_INTERVAL_DAYS;

  const annotated = cards.map((card) => {
    const isGrammar = card.content_type === 'grammar' || card.type === 'grammar' || Boolean(card.grammar);
    if (!isGrammar) {
      return { card, lockStatus: { isUnlocked: true, readinessPercent: 100, prerequisites: [] } };
    }

    const lockStatus = evaluateGrammarLockStatus(card, userVocabCards, thresholdDays);
    return { card, lockStatus };
  });

  if (mode === 'strict') {
    // Keep all non-grammar cards + unlocked grammar cards
    return annotated
      .filter(({ lockStatus }) => lockStatus.isUnlocked)
      .map(({ card }) => card);
  }

  // Open mode: sort unlocked cards first, then partially ready, then locked
  return annotated
    .sort((a, b) => b.lockStatus.readinessPercent - a.lockStatus.readinessPercent)
    .map(({ card }) => card);
}

/**
 * Returns all grammar points that require a given vocabulary word as prerequisite.
 * Useful for motivating learners: "Mastering this word unlocks N grammar points!"
 */
export function getVocabUnlockingImpact(vocabWord, allGrammar = null) {
  if (!vocabWord) return [];

  const targetWord = typeof vocabWord === 'string' ? vocabWord : (vocabWord.kanji || vocabWord.reading || '');
  const grammarList = allGrammar || rawGrammarData;

  const impacted = [];

  for (const g of grammarList) {
    const prereqs = getPrerequisitesForGrammar(g);
    const matches = prereqs.some((p) => p.kanji === targetWord || p.reading === targetWord || p.word === targetWord);
    if (matches) {
      impacted.push({
        grammar: g.grammar,
        meaning: g.meaning,
        jlpt: g.jlpt || 'N5',
        category: g.category || '',
      });
    }
  }

  return impacted;
}

