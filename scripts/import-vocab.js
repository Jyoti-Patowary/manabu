#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const connectDB = require('../src/lib/mongodb.js').default || require('../src/lib/mongodb.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'n5_vocab.json'); 

let newCards = [];
if (fs.existsSync(dataPath)) {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    newCards = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read/parse ${dataPath}:`, err.message);
    process.exit(2);
  }
} else {
  console.error('Data file not found:', dataPath);
  process.exit(2);
}

async function importVocab() {
  console.log('🔗 Connecting to MongoDB...');
  const mongoose = await connectDB();
  
  try {
    const db = mongoose.connection.db;
    const col = db.collection('collections'); 

    // 1. Find or create the master Collection document
    let collectionDoc = await col.findOne({ name: 'N5 Vocabulary' });
    
    if (!collectionDoc) {
      console.log('Creating nested Collection structure...');
      const newDoc = {
        name: 'N5 Vocabulary',
        description: 'JLPT N5 vocabulary collection (imported)',
        decks: [
          {
            name: 'Vocabulary',
            cards: []
          }
        ]
      };
      const res = await col.insertOne(newDoc);
      collectionDoc = await col.findOne({ _id: res.insertedId });
    }

    // 🚨 SAFETY NET: Fix the document if it exists but is missing the 'decks' array
    if (!collectionDoc.decks || !Array.isArray(collectionDoc.decks) || collectionDoc.decks.length === 0) {
      collectionDoc.decks = [{ name: 'Vocabulary', cards: [] }];
    }
    if (!collectionDoc.decks[0].cards) {
      collectionDoc.decks[0].cards = [];
    }

    // 2. Map existing DB cards by signature (Kanji + Reading) -> Index
    const existingCards = collectionDoc.decks[0].cards;
    const existingCardsMap = new Map();
    existingCards.forEach((card, index) => {
      const signature = `${card.kanji || ''}-${card.reading || ''}`;
      existingCardsMap.set(signature, index);
    });

    const cardsToInsert = [];
    const newSignaturesSeen = new Set();
    let updateCount = 0;
    let duplicateSkipCount = 0;
    let isModified = false;

    // 3. Process the new cards from the JSON
    for (const card of newCards) {
      const signature = `${card.kanji || ''}-${card.reading || ''}`;
      
      // AUTO-INJECT MISSING STUDY DATA (Fixes the Dashboard math issue!)
      const formattedCard = {
        ...card,
        interval: card.interval ?? 0,
        repetitions: card.repetitions ?? 0,
        easeFactor: card.easeFactor ?? 2.5,
        dueDate: card.dueDate ?? Date.now()
      };

      if (existingCardsMap.has(signature)) {
        // CARD ALREADY EXISTS -> UPDATE IT
        const idx = existingCardsMap.get(signature);
        const oldCard = existingCards[idx];

        const contentChanged = 
          oldCard.meaning !== formattedCard.meaning || 
          oldCard.example !== formattedCard.example || 
          oldCard.romaji !== formattedCard.romaji;

        if (contentChanged) {
          existingCards[idx] = {
            ...oldCard, 
            ...formattedCard,    
            // Preserve existing study progress
            interval: oldCard.interval,
            repetitions: oldCard.repetitions,
            easeFactor: oldCard.easeFactor,
            dueDate: oldCard.dueDate
          };
          updateCount++;
          isModified = true;
        } else {
          duplicateSkipCount++;
        }
      } else {
        // BRAND NEW CARD
        if (newSignaturesSeen.has(signature)) {
          duplicateSkipCount++;
        } else {
          cardsToInsert.push(formattedCard);
          newSignaturesSeen.add(signature);
          isModified = true;
        }
      }
    }

    // 4. Save changes back into the nested structure
    if (isModified) {
      const finalCardsArray = [...existingCards, ...cardsToInsert];
      
      // Update the cards array inside the first deck
      collectionDoc.decks[0].cards = finalCardsArray;

      await col.updateOne(
        { _id: collectionDoc._id },
        { $set: { decks: collectionDoc.decks } }
      );
      
      console.log(`✅ Success!`);
      if (cardsToInsert.length > 0) console.log(`   ➕ Added ${cardsToInsert.length} brand new words.`);
      if (updateCount > 0) console.log(`   🔄 Updated ${updateCount} existing words with new content.`);
    } else {
      console.log(`⚠️ No changes needed. All words are up to date.`);
    }
    
    console.log(`⏭️ Skipped ${duplicateSkipCount} exact duplicates.`);

  } catch (err) {
    console.error('❌ Import error:', err);
    process.exitCode = 2;
  } finally {
    process.exit();
  }
}

if (require.main === module) {
  importVocab().catch(err => { console.error(err); process.exit(2); });
}

module.exports = importVocab;