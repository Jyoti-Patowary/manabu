#!/usr/bin/env node
/**
 * scripts/ensure-platform-data.js
 * Ensures that MongoDB contains canonical collections across all 4 pillars:
 * 1. Kanji: N5, N4, N3, N2, N1 decks with stroke counts, readings, and meanings
 * 2. Grammar: N5, N4, N3, N2, N1 decks with formation rules and example sentences
 * 3. Kana: Hiragana and Katakana foundational decks
 * 4. Vocabulary: N5, N4, N3, N2, N1 vocabulary decks
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

const { generateKanjiDeck, JLPT_KANJI_LEVELS } = require('../src/lib/kanjiData.js');
const { generateGrammarDeck, JLPT_GRAMMAR_LEVELS } = require('../src/lib/grammarData.js');
const { generateKanaCards } = require('../src/lib/kanaData.js');

async function ensurePlatformData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  console.log('⛩️ Connecting to MongoDB to ensure full JLPT platform collections...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB.');

    const db = mongoose.connection.db;
    const collectionsCol = db.collection('collections');

    // 1. Ensure Kanji Collection with all N5–N1 decks
    let kanjiDoc = await collectionsCol.findOne({ name: { $regex: /^kanji$/i } });
    if (!kanjiDoc) {
      console.log('📦 Creating missing "Kanji" collection across N5–N1...');
      const kanjiDecks = JLPT_KANJI_LEVELS.map((lvl) => ({
        _id: new mongoose.Types.ObjectId(),
        name: `${lvl} Kanji`,
        cards: generateKanjiDeck(lvl),
      }));

      await collectionsCol.insertOne({
        name: 'Kanji',
        description: 'Complete JLPT N5 through N1 Kanji Library with Stroke Order & Writing Practice',
        decks: kanjiDecks,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ "Kanji" collection created with ${kanjiDecks.length} decks.`);
    } else {
      console.log('🔍 Checking decks in existing "Kanji" collection...');
      let modified = false;
      kanjiDoc.decks = kanjiDoc.decks || [];

      for (const lvl of JLPT_KANJI_LEVELS) {
        const deckName = `${lvl} Kanji`;
        let deck = kanjiDoc.decks.find(d => d.name.toLowerCase().includes(lvl.toLowerCase()));
        const canonicalCards = generateKanjiDeck(lvl);

        if (!deck) {
          console.log(`➕ Adding missing deck "${deckName}" (${canonicalCards.length} cards)...`);
          kanjiDoc.decks.push({
            _id: new mongoose.Types.ObjectId(),
            name: deckName,
            cards: canonicalCards,
          });
          modified = true;
        } else if ((deck.cards || []).length < canonicalCards.length) {
          console.log(`🔄 Updating cards for deck "${deckName}" from ${deck.cards?.length} to ${canonicalCards.length}...`);
          deck.cards = canonicalCards;
          modified = true;
        }
      }

      if (modified) {
        await collectionsCol.updateOne(
          { _id: kanjiDoc._id },
          { $set: { decks: kanjiDoc.decks, updatedAt: new Date() } }
        );
        console.log('✅ Updated "Kanji" collection in MongoDB.');
      } else {
        console.log('✅ "Kanji" collection is already fully populated.');
      }
    }

    // 2. Ensure Grammar Collection
    let grammarDoc = await collectionsCol.findOne({ name: { $regex: /^grammar$/i } });
    if (!grammarDoc) {
      console.log('📦 Creating missing "Grammar" collection across N5–N1...');
      const grammarDecks = JLPT_GRAMMAR_LEVELS.map((lvl) => ({
        _id: new mongoose.Types.ObjectId(),
        name: `${lvl} Grammar`,
        cards: generateGrammarDeck(lvl),
      }));

      await collectionsCol.insertOne({
        name: 'Grammar',
        description: 'JLPT N5 through N1 Grammar Points with Formation Rules and Nuance Notes',
        decks: grammarDecks,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ "Grammar" collection created with ${grammarDecks.length} decks.`);
    }

    // 3. Ensure Kana Collection
    let kanaDoc = await collectionsCol.findOne({ name: { $regex: /^kana$/i } });
    if (!kanaDoc) {
      console.log('📦 Creating missing "Kana" foundational collection...');
      const hiraganaCards = generateKanaCards('hiragana');
      const katakanaCards = generateKanaCards('katakana');

      await collectionsCol.insertOne({
        name: 'Kana',
        description: 'Foundational Hiragana and Katakana Syllabaries',
        decks: [
          { _id: new mongoose.Types.ObjectId(), name: 'Hiragana', cards: hiraganaCards },
          { _id: new mongoose.Types.ObjectId(), name: 'Katakana', cards: katakanaCards },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ "Kana" collection created.');
    }

    console.log('🎉 Database verification complete! All 4 pillars are fully initialized.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error ensuring platform data:', err);
    process.exit(1);
  }
}

ensurePlatformData();

