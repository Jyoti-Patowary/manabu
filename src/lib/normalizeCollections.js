function safeSlug(value, fallback = 'item') {
  const clean = String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return clean || fallback;
}

function toIdString(value, fallback) {
  if (value == null) return fallback;
  const candidate = typeof value === 'string' ? value : String(value);
  return candidate || fallback;
}

function matchRecordId(record, targetId) {
  if (targetId == null || targetId === '') return false;

  const candidates = [
    record?._id,
    record?.id,
    record?.cardId,
    record?.deckId,
    record?.slug,
  ];

  return candidates.some((value) => String(value ?? '') === String(targetId));
}

function normalizeCardForClient(card, index, deckName = 'deck') {
  const baseText = card?.kanji || card?.reading || card?.grammar || card?.meaning || `card-${deckName}`;
  const fallbackId = `card-${safeSlug(deckName)}-${safeSlug(baseText)}-${index}`;
  const id = toIdString(card?._id || card?.id, fallbackId);

  return {
    id,
    _id: id,
    type: card?.type || 'vocab',
    category: card?.category || '',
    jlpt: card?.jlpt || '',
    tags: Array.isArray(card?.tags) ? card.tags : [],
    kanji: card?.kanji || '',
    reading: card?.reading || '',
    romaji: card?.romaji || '',
    onyomi: card?.onyomi || card?.reading_onyomi || '',
    kunyomi: card?.kunyomi || card?.reading_kunyomi || '',
    strokes: Number(card?.strokes ?? card?.nb_strokes ?? 0),
    kanjiType: card?.kanjiType || card?.type || '',
    usageFrequency: card?.usageFrequency || card?.usage_frequency || '',
    definition: card?.definition || card?.item_meaning || card?.meaning || '',
    usage: card?.usage || card?.item_usage || '',
    howToUse: card?.howToUse || card?.item_usage_context || '',
    meaning: card?.meaning || '',
    partOfSpeech: card?.partOfSpeech || '',
    example: card?.example || '',
    exampleReading: card?.exampleReading || '',
    exampleMeaning: card?.exampleMeaning || '',
    examples: Array.isArray(card?.examples) ? card.examples : [],
    wordExamples: Array.isArray(card?.wordExamples) ? card.wordExamples : (Array.isArray(card?.word_examples) ? card.word_examples : []),
    sentenceExamples: Array.isArray(card?.sentenceExamples) ? card.sentenceExamples : (Array.isArray(card?.sentence_examples) ? card.sentence_examples : []),
    grammar: card?.grammar || '',
    formation: card?.formation || '',
    usage: card?.usage || card?.item_usage || '',
    grammarExamples: Array.isArray(card?.grammarExamples) ? card.grammarExamples : [],
    negative: card?.negative || '',
    past: card?.past || '',
    pastNegative: card?.pastNegative || '',
    commonMistake: card?.commonMistake || '',
    formalAlternative: card?.formalAlternative || '',
    interval: Number(card?.interval ?? 0),
    repetitions: Number(card?.repetitions ?? 0),
    easeFactor: Number(card?.easeFactor ?? 2.5),
    dueDate: Number(card?.dueDate ?? Date.now()),
  };
}

function normalizeDeckForClient(deck, deckIndex, collectionName = 'collection') {
  const baseText = deck?.name || `deck-${deckIndex}`;
  const fallbackId = `deck-${safeSlug(collectionName)}-${safeSlug(baseText)}-${deckIndex}`;
  const id = toIdString(deck?._id || deck?.id, fallbackId);

  return {
    id,
    _id: id,
    name: deck?.name || `Deck ${deckIndex + 1}`,
    cards: (deck?.cards || []).map((card, cardIndex) => normalizeCardForClient(card, cardIndex, deck?.name || baseText)),
  };
}

function normalizeCollectionsForClient(collections) {
  if (!Array.isArray(collections)) return [];

  return collections.map((collection, collectionIndex) => {
    const fallbackId = `collection-${safeSlug(collection?.name || 'collection')}-${collectionIndex}`;
    const id = toIdString(collection?._id || collection?.id, fallbackId);

    return {
      id,
      _id: id,
      name: collection?.name || `Collection ${collectionIndex + 1}`,
      description: collection?.description || '',
      decks: (collection?.decks || []).map((deck, deckIndex) => normalizeDeckForClient(deck, deckIndex, collection?.name || `Collection ${collectionIndex + 1}`)),
    };
  });
}

module.exports = {
  matchRecordId,
  normalizeCardForClient,
  normalizeDeckForClient,
  normalizeCollectionsForClient,
};
