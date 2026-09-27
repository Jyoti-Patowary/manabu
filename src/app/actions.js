'use server';

import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';
import { matchRecordId, normalizeJlptLevel } from '@/lib/normalizeCollections';
import { revalidatePath } from 'next/cache';

function safeSlug(value, fallback = 'item') {
  const clean = String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return clean || fallback;
}

// Compute fallback client ID matching normalizeCollections
function getServerCardId(card, index, deckName = 'deck') {
  const baseText = card?.kanji || card?.reading || card?.grammar || card?.meaning || `card-${deckName}`;
  const fallbackId = `card-${safeSlug(deckName)}-${safeSlug(baseText)}-${index}`;
  return card?._id ? card._id.toString() : (card?.id ? String(card.id) : fallbackId);
}

async function getCollectionDeckById(deckId) {
  await connectDB();

  const collections = await Collection.find({}).exec();

  for (const collection of collections) {
    const deckIndex = (collection.decks || []).findIndex((deck) => matchRecordId(deck, deckId));

    if (deckIndex !== -1) {
      return { collection, deckIndex, deck: collection.decks[deckIndex] };
    }
  }

  return null;
}

// Helper function to prevent review spikes by randomizing intervals slightly
function applyFuzz(interval) {
  if (interval < 3) return interval; 
  const fuzzRange = Math.max(1, Math.round(interval * 0.1));
  const min = interval - fuzzRange;
  const max = interval + fuzzRange;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 1. Create a new Deck inside a specific Collection
export async function createDeck(formData) {
  const name = formData.get('name');
  const collectionId = formData.get('collectionId');
  if (!name) return { error: 'Deck name is required' };

  await connectDB();
  
  if (collectionId) {
    await Collection.findByIdAndUpdate(collectionId, {
      $push: { decks: { _id: new mongoose.Types.ObjectId(), name, cards: [] } }
    });
  } else {
    // Default to the first collection or a 'General' collection
    let targetCollection = await Collection.findOne({});
    if (!targetCollection) {
      targetCollection = await Collection.create({ name: 'General', decks: [] });
    }
    targetCollection.decks.push({ _id: new mongoose.Types.ObjectId(), name, cards: [] });
    await targetCollection.save();
  }
  
  revalidatePath('/');
  return { success: true };
}

// 2. Create a new Parent Collection Folder
export async function createCollection(formData) {
  const name = formData.get('name');
  if (!name) return { error: 'Collection name is required' };

  await connectDB();
  await Collection.create({ name, decks: [] });
  revalidatePath('/');
  return { success: true };
}

// 3. Add a single card to a deck nested inside a collection
export async function addCard(deckId, cardData) {
  if (!cardData.reading && !cardData.kanji && !cardData.grammar) return;

  const match = await getCollectionDeckById(deckId);
  if (!match) return;

  let rawType = cardData.content_type || cardData.type || 'vocab';
  if (rawType === 'hiragana' || rawType === 'katakana') {
    rawType = 'kana';
  }
  const contentType = ['vocab', 'kanji', 'grammar', 'kana'].includes(rawType) ? rawType : (cardData.grammar ? 'grammar' : 'vocab');
  const jlptLevel = contentType === 'kana' ? null : (normalizeJlptLevel(cardData.jlpt_level || cardData.jlpt) || null);

  const deck = match.deck;
  deck.cards.push({
    ...cardData,
    _id: new mongoose.Types.ObjectId(),
    content_type: contentType,
    jlpt_level: jlptLevel,
    relationships: Array.isArray(cardData.relationships) ? cardData.relationships : [],
    type: cardData.type || contentType,
    jlpt: jlptLevel || cardData.jlpt || '',
    interval: 0,
    repetitions: 0,
    ease_factor: 2.5,
    easeFactor: 2.5,
    next_review_date: Date.now(),
    dueDate: Date.now()
  });

  match.collection.markModified('decks');
  await match.collection.save();
  revalidatePath('/');
}

// 4. Delete a card from a nested deck
export async function deleteCard(deckId, cardId) {
  const match = await getCollectionDeckById(deckId);
  if (!match) return;

  const deck = match.deck;
  const nextCards = (deck.cards || []).filter(
    (card, idx) => !matchRecordId(card, cardId) && getServerCardId(card, idx, deck.name) !== cardId
  );

  deck.cards = nextCards;
  match.collection.markModified('decks');
  await match.collection.save();
  revalidatePath('/');
}

// 5. Upgraded Smoothed SRS Logic for Nested Decks
export async function updateCardProgress(deckId, cardId, rating) {
  if (!deckId || String(deckId).startsWith('kana-practice-') || String(deckId).includes('-group')) {
    // Virtual practice or group session - client-side drill only
    return { success: true, virtual: true };
  }

  const match = await getCollectionDeckById(deckId);
  if (!match) {
    // If not found in DB, check if virtual
    if (String(deckId).includes('-practice-')) {
      return { success: true, virtual: true };
    }
    console.log("❌ Deck match not found for ID:", deckId);
    return;
  }

  const deck = match.deck;
  const cards = deck.cards || [];

  let cardIndex = -1;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const computedId = getServerCardId(card, i, deck.name || 'deck');
    if (
      matchRecordId(card, cardId) ||
      card._id?.toString() === cardId ||
      card.id?.toString() === cardId ||
      computedId === cardId
    ) {
      cardIndex = i;
      break;
    }
  }

  if (cardIndex === -1) {
    console.log("❌ Card not found in deck with ID:", cardId);
    return;
  }

  const card = cards[cardIndex];
  let { interval, repetitions } = card;
  let easeFactor = Number(card.ease_factor ?? card.easeFactor ?? 2.5);

  const MAX_INTERVAL = 45;

  if (rating === 1) {
    repetitions = 0;
    interval = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === 2) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 2;
    } else {
      interval = Math.round(interval * easeFactor);
      interval = applyFuzz(interval);
    }
    repetitions += 1;
  } else if (rating === 3) {
    if (repetitions === 0) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor * 1.3);
      interval = applyFuzz(interval);
    }
    repetitions += 1;
    easeFactor = Math.min(3.0, easeFactor + 0.15);
  }

  if (interval > 0) {
    interval = Math.min(interval, MAX_INTERVAL);
  }

  const dueDate = interval === 0 ? Date.now() : Date.now() + interval * 24 * 60 * 60 * 1000;
  const roundedEase = parseFloat(easeFactor.toFixed(2));

  card.interval = interval;
  card.repetitions = repetitions;
  card.ease_factor = roundedEase;
  card.easeFactor = roundedEase;
  card.next_review_date = dueDate;
  card.dueDate = dueDate;

  match.collection.markModified('decks');
  await match.collection.save();
  revalidatePath('/');
}

// 6. Bulk Import Cards into a Nested Deck
export async function addBulkCards(deckId, inputData) {
  if (!inputData) return { error: "Empty data" };

  const match = await getCollectionDeckById(deckId);
  if (!match) return { error: "Deck not found" };

  let cardsArray = [];
  let globalCategory = "";
  let globalLevel = "";

  if (!Array.isArray(inputData) && inputData.cards && Array.isArray(inputData.cards)) {
    cardsArray = inputData.cards;
    globalCategory = inputData.category || "";
    globalLevel = inputData.level || "";
  } else if (Array.isArray(inputData)) {
    cardsArray = inputData;
  } else {
    cardsArray = [inputData];
  }

  const validCards = cardsArray.filter(card =>
    (card.kanji && card.kanji.trim() !== "") ||
    (card.reading && card.reading.trim() !== "") ||
    (card.grammar && card.grammar.trim() !== "")
  );

  if (validCards.length === 0) return { error: "No valid cards found." };

  const newCards = validCards.map((card) => {
    const isGrammar = !!card.grammar;

    let formattedTags = [];
    if (Array.isArray(card.tags)) {
      formattedTags = card.tags;
    } else if (card.tag) {
      formattedTags = [card.tag];
    }

    let rawType = card.content_type || card.type || (isGrammar ? "grammar" : "vocab");
    if (rawType === 'hiragana' || rawType === 'katakana') {
      rawType = 'kana';
    }
    const contentType = ['vocab', 'kanji', 'grammar', 'kana'].includes(rawType) ? rawType : (isGrammar ? 'grammar' : 'vocab');
    const jlptLevel = contentType === 'kana' ? null : (normalizeJlptLevel(card.jlpt_level || card.jlpt || globalLevel) || null);
    const easeFactor = Number(card.ease_factor ?? card.easeFactor ?? 2.5);
    const nextReviewDate = Number(card.next_review_date ?? card.dueDate ?? Date.now());

    return {
      _id: new mongoose.Types.ObjectId(),
      content_type: contentType,
      jlpt_level: jlptLevel,
      relationships: Array.isArray(card.relationships) ? card.relationships : [],
      type: card.type || contentType,
      category: card.category || globalCategory || "",
      jlpt: jlptLevel || card.jlpt || globalLevel || "",
      tags: formattedTags,
      kanji: card.kanji || "",
      reading: card.reading || "",
      romaji: card.romaji || "",
      onyomi: card.onyomi || "",
      kunyomi: card.kunyomi || "",
      strokes: card.strokes || 0,
      meaning: card.meaning || "No meaning provided",
      partOfSpeech: card.partOfSpeech || "",
      example: card.example || "",
      exampleReading: card.exampleReading || "",
      exampleMeaning: card.exampleMeaning || "",
      grammar: card.grammar || "",
      formation: card.formation || "",
      usage: card.usage || "",
      grammarExamples: card.examples || card.grammarExamples || [],
      negative: card.negative || "",
      past: card.past || "",
      pastNegative: card.pastNegative || card.past_negative || "",
      commonMistake: card.commonMistake || card.common_mistake || "",
      formalAlternative: card.formalAlternative || card.formal_alternative || "",
      interval: card.interval || 0,
      repetitions: card.repetitions || 0,
      ease_factor: easeFactor,
      easeFactor,
      next_review_date: nextReviewDate,
      dueDate: nextReviewDate
    };
  });

  match.deck.cards.push(...newCards);
  match.collection.markModified('decks');
  await match.collection.save();

  revalidatePath('/');
  return { success: true, count: newCards.length };
}

// Fetch only specific card types
export async function getCardsByType(deckId, cardType) {
  const match = await getCollectionDeckById(deckId);
  if (!match) return [];

  const cards = match.deck?.cards || [];

  if (!cardType || cardType === 'all') {
    return cards;
  }

  return cards.filter((card) => {
    const ct = card.content_type || (card.type === 'hiragana' || card.type === 'katakana' ? 'kana' : card.type);
    return ct === cardType || card.type === cardType;
  });
}

export async function getStudyQueueForType(deckId, cardType) {
  return await getCardsByType(deckId, cardType);
}

// 12. Add word directly from Graded Reader into user's SRS deck
export async function addWordFromReader(cardData) {
  if (!cardData || (!cardData.reading && !cardData.kanji && !cardData.grammar)) {
    return { error: 'Card data is required' };
  }

  await connectDB();

  // Find a target collection (e.g. Vocabulary, N5, General)
  let targetCollection = await Collection.findOne({
    name: { $regex: /vocab|語彙|読解|reading|general|n5|n4|n3/i }
  });

  if (!targetCollection) {
    targetCollection = await Collection.findOne({});
    if (!targetCollection) {
      targetCollection = await Collection.create({ name: 'General', decks: [] });
    }
  }

  // Look for a reading/vocab deck
  let targetDeck = targetCollection.decks.find(d => 
    d.name.toLowerCase().includes('reading') || 
    d.name.toLowerCase().includes('vocab') ||
    d.name.includes('語彙') ||
    d.name.includes('読解')
  );

  if (!targetDeck) {
    targetDeck = {
      _id: new mongoose.Types.ObjectId(),
      name: '読解ボキャブラリー (Reading Vocab)',
      cards: []
    };
    targetCollection.decks.push(targetDeck);
  }

  let rawType = cardData.content_type || cardData.type || 'vocab';
  const contentType = ['vocab', 'kanji', 'grammar', 'kana'].includes(rawType) ? rawType : 'vocab';
  const jlptLevel = normalizeJlptLevel(cardData.jlpt_level || cardData.jlpt) || 'N5';

  const wordKey = cardData.kanji || cardData.reading;
  const alreadyExists = targetDeck.cards.some(c => 
    (c.kanji && c.kanji === wordKey) || (c.reading && c.reading === wordKey)
  );

  if (!alreadyExists) {
    targetDeck.cards.push({
      _id: new mongoose.Types.ObjectId(),
      kanji: cardData.kanji || '',
      reading: cardData.reading || '',
      meaning: cardData.meaning || '',
      partOfSpeech: cardData.partOfSpeech || 'vocab',
      content_type: contentType,
      jlpt_level: jlptLevel,
      relationships: Array.isArray(cardData.relationships) ? cardData.relationships : [],
      type: contentType,
      jlpt: jlptLevel,
      interval: 0,
      repetitions: 0,
      ease_factor: 2.5,
      easeFactor: 2.5,
      next_review_date: Date.now(),
      dueDate: Date.now()
    });

    targetCollection.markModified('decks');
    await targetCollection.save();
    revalidatePath('/');
  }

  return { success: true };
}

// 7. Course Curriculum Server Actions
export async function fetchCourseLessons() {
  const { getOrCreateDefaultUser, getCurriculumLessons } = await import('@/lib/courseEngine.js');
  const { user } = await getOrCreateDefaultUser();
  const lessons = await getCurriculumLessons(user._id);
  return JSON.parse(JSON.stringify(lessons));
}

export async function fetchLessonDetail(lessonId) {
  const { getOrCreateDefaultUser, getLessonDetail } = await import('@/lib/courseEngine.js');
  const { user } = await getOrCreateDefaultUser();
  const detail = await getLessonDetail(lessonId, user._id);
  return JSON.parse(JSON.stringify(detail));
}

export async function enrollGrammarPointAction(grammarPointId) {
  const { getOrCreateDefaultUser, enrollGrammarPointInSRS } = await import('@/lib/courseEngine.js');
  const { user } = await getOrCreateDefaultUser();
  const res = await enrollGrammarPointInSRS(user._id, grammarPointId);
  revalidatePath('/');
  return JSON.parse(JSON.stringify(res));
}

export async function fetchDueCards() {
  const { getOrCreateDefaultUser, getDueUserCards } = await import('@/lib/courseEngine.js');
  const { user } = await getOrCreateDefaultUser();
  const cards = await getDueUserCards(user._id);
  return JSON.parse(JSON.stringify(cards));
}

export async function submitCardReview(userCardId, rating) {
  const { getOrCreateDefaultUser, recordUserCardReview } = await import('@/lib/courseEngine.js');
  const { user } = await getOrCreateDefaultUser();
  const res = await recordUserCardReview(user._id, userCardId, rating);
  revalidatePath('/');
  return JSON.parse(JSON.stringify(res));
}

export async function completeLessonAction(lessonId) {
  const { getOrCreateDefaultUser, markLessonComplete } = await import('@/lib/courseEngine.js');
  const { user } = await getOrCreateDefaultUser();
  const res = await markLessonComplete(user._id, lessonId);
  revalidatePath('/');
  return JSON.parse(JSON.stringify(res));
}