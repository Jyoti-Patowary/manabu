const COLLECTION_BLUEPRINT = [
  {
    id: 'hiragana',
    name: 'Hiragana',
    decks: [
      { id: 'hiragana-basics', name: 'Hiragana Basics' },
      { id: 'hiragana-advanced', name: 'Hiragana Advanced' },
    ],
  },
  {
    id: 'katakana',
    name: 'Katakana',
    decks: [
      { id: 'katakana-basics', name: 'Katakana Basics' },
      { id: 'katakana-advanced', name: 'Katakana Advanced' },
    ],
  },
  {
    id: 'vocabs',
    name: 'Vocabs',
    decks: [
      { id: 'people-vocabs', name: 'People Vocabs' },
      { id: 'daily-life-vocabs', name: 'Daily Life Vocabs' },
      { id: 'travel-vocabs', name: 'Travel Vocabs' },
    ],
  },
  {
    id: 'grammar',
    name: 'Grammar',
    decks: [
      { id: 'n5-grammar', name: 'N5 Grammar' },
      { id: 'n4-grammar', name: 'N4 Grammar' },
    ],
  },
  {
    id: 'kanji',
    name: 'Kanji',
    decks: [
      { id: 'n5-kanji', name: 'N5 Kanji' },
      { id: 'n4-kanji', name: 'N4 Kanji' },
    ],
  },
];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function idFrom(value, fallback) {
  if (!value) return fallback;
  return typeof value.toString === 'function' ? value.toString() : String(value);
}

function cleanCard(card, index) {
  const safeCard = {
    ...card,
    id: idFrom(card && card._id, `card-${index}`),
  };

  delete safeCard._id;

  if (Array.isArray(safeCard.grammarExamples)) {
    safeCard.grammarExamples = safeCard.grammarExamples.map((example) => {
      const safeExample = { ...example };
      delete safeExample._id;
      return safeExample;
    });
  }

  return safeCard;
}

function cleanDeck(deck) {
  const safeDeck = {
    ...deck,
    id: idFrom(deck && deck._id, normalize(deck && deck.name).replace(/\s+/g, '-')),
    cards: (deck.cards || []).map(cleanCard),
  };

  delete safeDeck._id;
  delete safeDeck.__v;

  return safeDeck;
}

function hasCardType(deck, type) {
  return (deck.cards || []).some((card) => normalize(card.type) === type);
}

function hasJlptLevel(deck, level) {
  const normalizedLevel = normalize(level);
  return (deck.cards || []).some((card) => {
    const jlpt = normalize(card.jlpt).replace('jlpt_', '');
    return jlpt === normalizedLevel;
  });
}

function hasKanaScript(deck, script) {
  const pattern = script === 'hiragana' ? /[ぁ-ゖ]/ : /[ァ-ヶ]/;

  return (deck.cards || []).some((card) => {
    const type = normalize(card.type);
    if (type === script) return true;

    const value = `${card.reading || ''}${card.kana || ''}`;
    return pattern.test(value);
  });
}

function matchesDeck(deck, collectionName, deckName) {
  const name = normalize(deck.name);
  const category = normalize(deck.category);
  const target = normalize(deckName);

  if (name === target) return true;

  if (collectionName === 'Hiragana') {
    return hasKanaScript(deck, 'hiragana') && (name.includes('hiragana') || category.includes('hiragana'));
  }

  if (collectionName === 'Katakana') {
    return hasKanaScript(deck, 'katakana') && (name.includes('katakana') || category.includes('katakana'));
  }

  if (collectionName === 'Vocabs') {
    if (target === 'people vocabs') {
      return hasCardType(deck, 'vocab') && (name.includes('people') || category.includes('people'));
    }
    if (target === 'daily life vocabs') {
      return hasCardType(deck, 'vocab') && (name.includes('daily') || category.includes('daily'));
    }
    if (target === 'travel vocabs') {
      return hasCardType(deck, 'vocab') && (name.includes('travel') || category.includes('travel'));
    }
  }

  if (collectionName === 'Grammar') {
    const level = target.slice(0, 2);
    return hasCardType(deck, 'grammar') && (name.includes(level) || hasJlptLevel(deck, level));
  }

  if (collectionName === 'Kanji') {
    const level = target.slice(0, 2);
    return hasCardType(deck, 'kanji') && (name.includes(level) || hasJlptLevel(deck, level));
  }

  return false;
}

function makeEmptyDeck(deck) {
  return {
    ...deck,
    cards: [],
  };
}

function buildDeckCollections(rawDecks, options = {}) {
  const includeEmptyDecks = options.includeEmptyDecks === true;
  const sourceDecks = (rawDecks || []).map(cleanDeck);
  const usedDeckIds = new Set();

  const collections = COLLECTION_BLUEPRINT.map((collection) => {
    const decks = collection.decks.flatMap((targetDeck) => {
      const matches = sourceDecks.filter((deck) => {
        if (usedDeckIds.has(deck.id)) return false;
        return matchesDeck(deck, collection.name, targetDeck.name);
      });

      matches.forEach((deck) => usedDeckIds.add(deck.id));

      if (matches.length === 0) {
        return includeEmptyDecks ? [makeEmptyDeck(targetDeck)] : [];
      }

      if (matches.length === 1 && normalize(matches[0].name) === normalize(targetDeck.name)) {
        return [{
          ...targetDeck,
          ...matches[0],
          name: targetDeck.name,
        }];
      }

      return [{
        ...targetDeck,
        cards: matches.flatMap((deck) => deck.cards || []),
      }];
    });

    return {
      id: collection.id,
      name: collection.name,
      decks,
    };
  });

  sourceDecks.forEach((deck) => {
    if (usedDeckIds.has(deck.id)) return;

    if (hasKanaScript(deck, 'hiragana') || normalize(deck.name).includes('hiragana')) {
      collections[0].decks.push(deck);
      return;
    }

    if (hasKanaScript(deck, 'katakana') || normalize(deck.name).includes('katakana')) {
      collections[1].decks.push(deck);
      return;
    }

    if (hasCardType(deck, 'grammar') || normalize(deck.name).includes('grammar')) {
      collections[3].decks.push(deck);
      return;
    }

    if (hasCardType(deck, 'kanji') || normalize(deck.name).includes('kanji')) {
      collections[4].decks.push(deck);
      return;
    }

    collections[2].decks.push(deck);
  });

  return collections;
}

module.exports = { buildDeckCollections };
