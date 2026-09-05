'use server';

import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';
import { matchRecordId } from '@/lib/normalizeCollections';
import { revalidatePath } from 'next/cache';

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

// 1. Create a new Deck inside a specific Collection
export async function createDeck(formData) {
  const name = formData.get('name');
  const collectionId = formData.get('collectionId');
  if (!name || !collectionId) return;

  await connectDB();
  await Collection.findByIdAndUpdate(collectionId, {
    $push: { decks: { _id: new mongoose.Types.ObjectId(), name, cards: [] } }
  });
  revalidatePath('/');
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
  if (!cardData.reading || !cardData.meaning) return;

  const match = await getCollectionDeckById(deckId);
  if (!match) return;

  const deck = match.deck;
  deck.cards.push({
    ...cardData,
    _id: new mongoose.Types.ObjectId(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: Date.now()
  });

  await match.collection.save();
  revalidatePath('/');
}

// 4. Delete a card from a nested deck
export async function deleteCard(deckId, cardId) {
  const match = await getCollectionDeckById(deckId);
  if (!match) return;

  const deck = match.deck;
  const nextCards = (deck.cards || []).filter(
    (card) => !matchRecordId(card, cardId)
  );

  deck.cards = nextCards;
  await match.collection.save();
  revalidatePath('/');
}

// Helper function to prevent review spikes by randomizing intervals slightly
function applyFuzz(interval) {
  if (interval < 3) return interval; 
  const fuzzRange = Math.max(1, Math.round(interval * 0.1));
  const min = interval - fuzzRange;
  const max = interval + fuzzRange;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 5. Upgraded Smoothed SRS Logic for Nested Decks
export async function updateCardProgress(deckId, cardId, rating) {
  const match = await getCollectionDeckById(deckId);
  if (!match) return;

  const deck = match.deck;
  const cardIndex = (deck.cards || []).findIndex(
    (card) => matchRecordId(card, cardId)
  );

  if (cardIndex === -1) return;

  const card = deck.cards[cardIndex];
  let { interval, repetitions, easeFactor } = card;

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

  deck.cards[cardIndex] = {
    ...card.toObject ? card.toObject() : card,
    interval,
    repetitions,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    dueDate
  };

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

    return {
      _id: new mongoose.Types.ObjectId(),
      type: isGrammar ? "grammar" : "vocab",
      category: card.category || globalCategory || "",
      jlpt: card.jlpt || globalLevel || "",
      tags: formattedTags,
      kanji: card.kanji || "",
      reading: card.reading || "",
      romaji: card.romaji || "",
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
      easeFactor: card.easeFactor || 2.5,
      dueDate: card.dueDate || Date.now()
    };
  });

  match.deck.cards.push(...newCards);
  await match.collection.save();

  revalidatePath('/');
  return { success: true, count: newCards.length };
}

// Fetch only specific card types (e.g., 'vocab', 'grammar', 'kanji') from a deck
export async function getCardsByType(deckId, cardType) {
  const match = await getCollectionDeckById(deckId);
  if (!match) return [];

  const cards = match.deck?.cards || [];

  if (!cardType || cardType === 'all') {
    return cards;
  }

  return cards.filter((card) => card.type === cardType);
}

export async function getStudyQueueForType(deckId, cardType) {
  const cards = await getCardsByType(deckId, cardType);
  return cards;
}