#!/usr/bin/env node
/**
 * Seeds or verifies the unified Kanji module in MongoDB across N5 through N1:
 * - Creates 'Kanji' collection if missing
 * - Populates N5 (73), N4 (151), N3 (341), N2 (345), N1 (1136) kanji decks
 * - Schema: content_type: 'kanji', jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');
const { generateKanjiDeck, JLPT_KANJI_LEVELS, KANJI_COUNT_BY_LEVEL } = require('../src/lib/kanjiData.js');

async function seedKanji() {
  const isDryRun = process.argv.includes('--dry-run');
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  console.log(`⛩️ Seeding Unified Kanji Module across JLPT N5–N1 ${isDryRun ? '(DRY RUN)' : ''}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    const db = mongoose.connection.db;
    const collectionsCol = db.collection('collections');

    let kanjiCol = await collectionsCol.findOne({ name: { $regex: /kanji|漢字/i } });

    if (!kanjiCol) {
      console.log('Creating "Kanji Master Collection" with N5–N1 decks...');
      const decks = JLPT_KANJI_LEVELS.map((level) => {
        const cards = generateKanjiDeck(level);
        return {
          _id: new mongoose.Types.ObjectId(),
          name: `${level} Kanji`,
          cards,
        };
      });

      const newDoc = {
        name: 'Kanji',
        description: 'Complete JLPT N5 through N1 Kanji Library with Stroke Order & Writing Practice',
        decks,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!isDryRun) {
        await collectionsCol.insertOne(newDoc);
        console.log(`✅ Created "Kanji" collection with 5 decks (N5 to N1).`);
      }
    } else {
      console.log(`Found existing Kanji collection: "${kanjiCol.name}". Checking decks...`);
      let modified = false;

      if (!Array.isArray(kanjiCol.decks)) {
        kanjiCol.decks = [];
      }

      for (const level of JLPT_KANJI_LEVELS) {
        const deckName = `${level} Kanji`;
        let deck = kanjiCol.decks.find(d => d.name.toLowerCase().includes(level.toLowerCase()));

        const canonicalCards = generateKanjiDeck(level);

        if (!deck) {
          console.log(`Adding missing deck: "${deckName}" (${canonicalCards.length} cards)...`);
          kanjiCol.decks.push({
            _id: new mongoose.Types.ObjectId(),
            name: deckName,
            cards: canonicalCards,
          });
          modified = true;
        } else {
          const existingSigs = new Set((deck.cards || []).map(c => c.kanji || c.unicode));
          const missingCards = canonicalCards.filter(c => !existingSigs.has(c.kanji));

          if (missingCards.length > 0) {
            deck.cards = [...(deck.cards || []), ...missingCards];
            modified = true;
            console.log(`Added ${missingCards.length} missing kanji to deck "${deck.name}".`);
          }
        }
      }

      if (modified && !isDryRun) {
        await collectionsCol.updateOne(
          { _id: kanjiCol._id },
          { $set: { decks: kanjiCol.decks } }
        );
        console.log('✅ Updated Kanji collection with unified cards.');
      } else {
        console.log('✅ Kanji collection is already fully populated across all levels.');
      }
    }

    console.log('🎉 Kanji module seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  seedKanji();
}

module.exports = { seedKanji };

