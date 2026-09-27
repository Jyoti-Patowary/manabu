import rawN5Vocab from '../../data/n5_vocab.json' with { type: 'json' };
import rawN4Vocab from '../../data/n4_vocab.json' with { type: 'json' };
import rawN3Vocab from '../../data/n3_vocab.json' with { type: 'json' };
import rawN2Vocab from '../../data/n2_vocab.json' with { type: 'json' };
import rawN1Vocab from '../../data/n1_vocab.json' with { type: 'json' };
import { generateKanjiDeck } from './kanjiData.js';
import { generateGrammarDeck } from './grammarData.js';
import { generateKanaCards } from './kanaData.js';
import { normalizeCardForClient } from './normalizeCollections.js';

let cachedDefaultCollections = null;

export function getDefaultCollections() {
  if (cachedDefaultCollections) {
    return cachedDefaultCollections;
  }

  const now = Date.now();
  const pastHour = now - 3600000;
  const tomorrow = now + 86400000;

  // 1. N5 Vocabulary Deck (718 complete words)
  const n5VocabRaw = rawN5Vocab.map((v, idx) => {
    const isDue = idx < 15;
    const isMastered = idx >= 15 && idx < 30;

    return normalizeCardForClient({
      ...v,
      id: `vocab-n5-${idx}-${v.kanji || v.reading}`,
      content_type: 'vocab',
      jlpt_level: 'N5',
      jlpt: 'N5',
      category: v.category || 'N5 Vocabulary',
      repetitions: isDue ? 1 : (isMastered ? 3 : 0),
      interval: isDue ? 1 : (isMastered ? 14 : 0),
      ease_factor: 2.5,
      dueDate: isDue ? pastHour : tomorrow,
      next_review_date: isDue ? pastHour : tomorrow,
      mastered: isMastered,
    }, idx, 'N5 Vocabulary');
  });

  // 2. N5 Kanji Deck (All 73 N5 Kanji)
  const n5KanjiRaw = generateKanjiDeck('N5').map((k, idx) => {
    const isDue = idx < 5;
    const isMastered = idx >= 5 && idx < 12;
    return {
      ...k,
      id: k.id || `kanji-n5-${idx}`,
      content_type: 'kanji',
      jlpt_level: 'N5',
      jlpt: 'N5',
      repetitions: isDue ? 1 : (isMastered ? 2 : 0),
      interval: isDue ? 1 : (isMastered ? 8 : 0),
      dueDate: isDue ? pastHour : tomorrow,
      next_review_date: isDue ? pastHour : tomorrow,
      mastered: isMastered,
    };
  });

  // 3. N5 Grammar Deck (~40 N5 Grammar Points)
  const n5GrammarDeckObj = generateGrammarDeck('N5', { limit: 40 });
  const n5GrammarRaw = n5GrammarDeckObj.cards.map((g, idx) => {
    const isDue = idx < 3;
    const isMastered = idx >= 3 && idx < 8;
    return {
      ...g,
      id: g.id || `grammar-n5-${idx}`,
      content_type: 'grammar',
      jlpt_level: 'N5',
      jlpt: 'N5',
      repetitions: isDue ? 1 : (isMastered ? 2 : 0),
      interval: isDue ? 1 : (isMastered ? 7 : 0),
      dueDate: isDue ? pastHour : tomorrow,
      next_review_date: isDue ? pastHour : tomorrow,
      mastered: isMastered,
    };
  });

  // 4. Kana Decks (Hiragana 46 + Katakana 46)
  const hiraganaCards = generateKanaCards('hiragana').slice(0, 46).map((c, idx) => ({
    ...c,
    id: `kana-hira-${c.reading || idx}`,
    content_type: 'kana',
    jlpt_level: null,
    repetitions: idx < 5 ? 1 : 0,
    interval: idx < 5 ? 1 : 0,
    dueDate: idx < 5 ? pastHour : tomorrow,
    next_review_date: idx < 5 ? pastHour : tomorrow,
  }));

  const katakanaCards = generateKanaCards('katakana').slice(0, 46).map((c, idx) => ({
    ...c,
    id: `kana-kata-${c.reading || idx}`,
    content_type: 'kana',
    jlpt_level: null,
    repetitions: idx < 3 ? 1 : 0,
    interval: idx < 3 ? 1 : 0,
    dueDate: idx < 3 ? pastHour : tomorrow,
    next_review_date: idx < 3 ? pastHour : tomorrow,
  }));

  // 5. N4 Decks (Vocab 668 + Grammar 19 + Kanji 151)
  const n4VocabRaw = rawN4Vocab.map((v, idx) => normalizeCardForClient({
    ...v,
    id: `vocab-n4-${idx}-${v.kanji || v.reading}`,
    content_type: 'vocab',
    jlpt_level: 'N4',
    jlpt: 'N4',
    category: 'N4 Vocabulary',
    repetitions: 0,
    interval: 0,
    ease_factor: 2.5,
    dueDate: tomorrow,
    next_review_date: tomorrow,
  }, idx, 'N4 Vocabulary'));

  const n4GrammarDeckObj = generateGrammarDeck('N4');
  const n4GrammarRaw = n4GrammarDeckObj.cards.map((g) => ({
    ...g,
    content_type: 'grammar',
    jlpt_level: 'N4',
    jlpt: 'N4',
  }));

  const n4KanjiRaw = generateKanjiDeck('N4').map((k) => ({
    ...k,
    content_type: 'kanji',
    jlpt_level: 'N4',
    jlpt: 'N4',
  }));

  // 6. N3 Decks (Vocab 2,139 + Kanji 341)
  const n3VocabRaw = rawN3Vocab.map((v, idx) => normalizeCardForClient({
    ...v,
    id: `vocab-n3-${idx}-${v.kanji || v.reading}`,
    content_type: 'vocab',
    jlpt_level: 'N3',
    jlpt: 'N3',
    category: 'N3 Vocabulary',
    repetitions: 0,
    interval: 0,
    ease_factor: 2.5,
    dueDate: tomorrow,
    next_review_date: tomorrow,
  }, idx, 'N3 Vocabulary'));

  const n3KanjiRaw = generateKanjiDeck('N3').map((k) => ({
    ...k,
    content_type: 'kanji',
    jlpt_level: 'N3',
    jlpt: 'N3',
  }));

  // 7. N2 Decks (Vocab 1,748 + Kanji 345)
  const n2VocabRaw = rawN2Vocab.map((v, idx) => normalizeCardForClient({
    ...v,
    id: `vocab-n2-${idx}-${v.kanji || v.reading}`,
    content_type: 'vocab',
    jlpt_level: 'N2',
    jlpt: 'N2',
    category: 'N2 Vocabulary',
    repetitions: 0,
    interval: 0,
    ease_factor: 2.5,
    dueDate: tomorrow,
    next_review_date: tomorrow,
  }, idx, 'N2 Vocabulary'));

  const n2KanjiRaw = generateKanjiDeck('N2').map((k) => ({
    ...k,
    content_type: 'kanji',
    jlpt_level: 'N2',
    jlpt: 'N2',
  }));

  // 8. N1 Decks (Vocab 2,699 + Kanji 1,136)
  const n1VocabRaw = rawN1Vocab.map((v, idx) => normalizeCardForClient({
    ...v,
    id: `vocab-n1-${idx}-${v.kanji || v.reading}`,
    content_type: 'vocab',
    jlpt_level: 'N1',
    jlpt: 'N1',
    category: 'N1 Vocabulary',
    repetitions: 0,
    interval: 0,
    ease_factor: 2.5,
    dueDate: tomorrow,
    next_review_date: tomorrow,
  }, idx, 'N1 Vocabulary'));

  const n1KanjiRaw = generateKanjiDeck('N1').map((k) => ({
    ...k,
    content_type: 'kanji',
    jlpt_level: 'N1',
    jlpt: 'N1',
  }));

  const collections = [
    {
      id: 'collection-jlpt-n5',
      _id: 'collection-jlpt-n5',
      name: 'JLPT N5 Foundation (初級)',
      description: 'Essential N5 Vocabulary, Kanji, and Grammar for beginners',
      decks: [
        {
          id: 'deck-n5-vocab',
          _id: 'deck-n5-vocab',
          name: 'N5 Vocabulary (語彙)',
          cards: n5VocabRaw,
        },
        {
          id: 'deck-n5-kanji',
          _id: 'deck-n5-kanji',
          name: 'N5 Kanji (漢字)',
          cards: n5KanjiRaw,
        },
        {
          id: 'deck-n5-grammar',
          _id: 'deck-n5-grammar',
          name: 'N5 Grammar (文法)',
          cards: n5GrammarRaw,
        },
      ],
    },
    {
      id: 'collection-kana',
      _id: 'collection-kana',
      name: 'かな・Kana Foundation',
      description: 'Master Hiragana and Katakana character recognition & readings',
      decks: [
        {
          id: 'deck-kana-hiragana',
          _id: 'deck-kana-hiragana',
          name: 'Hiragana (ひらがな)',
          cards: hiraganaCards,
        },
        {
          id: 'deck-kana-katakana',
          _id: 'deck-kana-katakana',
          name: 'Katakana (カタカナ)',
          cards: katakanaCards,
        },
      ],
    },
    {
      id: 'collection-jlpt-n4',
      _id: 'collection-jlpt-n4',
      name: 'JLPT N4 Elementary (初中級)',
      description: 'Conversational patterns, vocabulary, and elementary kanji',
      decks: [
        {
          id: 'deck-n4-vocab',
          _id: 'deck-n4-vocab',
          name: 'N4 Vocabulary (語彙)',
          cards: n4VocabRaw,
        },
        {
          id: 'deck-n4-grammar',
          _id: 'deck-n4-grammar',
          name: 'N4 Grammar (文法)',
          cards: n4GrammarRaw,
        },
        {
          id: 'deck-n4-kanji',
          _id: 'deck-n4-kanji',
          name: 'N4 Kanji (漢字)',
          cards: n4KanjiRaw,
        },
      ],
    },
    {
      id: 'collection-jlpt-n3',
      _id: 'collection-jlpt-n3',
      name: 'JLPT N3 Intermediate (中級)',
      description: 'Bridge from basic rules to natural Japanese expressions',
      decks: [
        {
          id: 'deck-n3-vocab',
          _id: 'deck-n3-vocab',
          name: 'N3 Vocabulary (語彙)',
          cards: n3VocabRaw,
        },
        {
          id: 'deck-n3-kanji',
          _id: 'deck-n3-kanji',
          name: 'N3 Kanji (漢字)',
          cards: n3KanjiRaw,
        },
      ],
    },
    {
      id: 'collection-jlpt-n2',
      _id: 'collection-jlpt-n2',
      name: 'JLPT N2 Upper-Intermediate (上中級)',
      description: 'Extensive business and everyday natural Japanese vocabulary & kanji',
      decks: [
        {
          id: 'deck-n2-vocab',
          _id: 'deck-n2-vocab',
          name: 'N2 Vocabulary (語彙)',
          cards: n2VocabRaw,
        },
        {
          id: 'deck-n2-kanji',
          _id: 'deck-n2-kanji',
          name: 'N2 Kanji (漢字)',
          cards: n2KanjiRaw,
        },
      ],
    },
    {
      id: 'collection-jlpt-n1',
      _id: 'collection-jlpt-n1',
      name: 'JLPT N1 Advanced (上級)',
      description: 'Advanced academic, cultural, and native-level vocabulary & kanji',
      decks: [
        {
          id: 'deck-n1-vocab',
          _id: 'deck-n1-vocab',
          name: 'N1 Vocabulary (語彙)',
          cards: n1VocabRaw,
        },
        {
          id: 'deck-n1-kanji',
          _id: 'deck-n1-kanji',
          name: 'N1 Kanji (漢字)',
          cards: n1KanjiRaw,
        },
      ],
    },
  ];

  cachedDefaultCollections = collections;
  return collections;
}
