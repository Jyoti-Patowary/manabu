#!/usr/bin/env node
/**
 * Seeds or verifies the unified Kana module in MongoDB:
 * - Creates 'Kana Foundation' collection if missing
 * - Seeds 104 Hiragana and 104 Katakana cards with counterpart links
 * - Schema: content_type: 'kana', jlpt_level: null
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');
const { generateKanaCards } = require('../src/lib/kanaData.js');

async function seedKana() {
  const isDryRun = process.argv.includes('--dry-run');
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  console.log(`🌸 Seeding Unified Kana Module ${isDryRun ? '(DRY RUN)' : ''}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    const db = mongoose.connection.db;
    const collectionsCol = db.collection('collections');

    const hiraganaCards = generateKanaCards({ scriptType: 'hiragana', section: 'all' });
    const katakanaCards = generateKanaCards({ scriptType: 'katakana', section: 'all' });

    console.log(`Generated ${hiraganaCards.length} Hiragana cards and ${katakanaCards.length} Katakana cards.`);

    let kanaCol = await collectionsCol.findOne({ name: { $regex: /kana|五十音/i } });

    if (!kanaCol) {
      console.log('Creating "Kana Foundation" collection...');
      const newDoc = {
        name: 'Kana Foundation',
        description: 'Complete 104 Hiragana and Katakana sounds with reciprocal counterpart relationships',
        decks: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'Hiragana (ひらがな 104音)',
            cards: hiraganaCards,
          },
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'Katakana (カタカナ 104音)',
            cards: katakanaCards,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!isDryRun) {
        await collectionsCol.insertOne(newDoc);
        console.log('✅ Created "Kana Foundation" collection with Hiragana and Katakana decks.');
      }
    } else {
      console.log(`Found existing Kana collection: "${kanaCol.name}". Checking decks...`);
      let modified = false;

      if (!Array.isArray(kanaCol.decks) || kanaCol.decks.length === 0) {
        kanaCol.decks = [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'Hiragana (ひらがな 104音)',
            cards: hiraganaCards,
          },
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'Katakana (カタカナ 104音)',
            cards: katakanaCards,
          },
        ];
        modified = true;
      } else {
        // Ensure each deck has cards with unified content_type: 'kana' and jlpt_level: null
        for (const deck of kanaCol.decks) {
          const isKata = deck.name.toLowerCase().includes('katakana');
          const sourceCards = isKata ? katakanaCards : hiraganaCards;
          const existingSigs = new Set((deck.cards || []).map(c => c.reading || c.kanji));

          const missingCards = sourceCards.filter(c => !existingSigs.has(c.reading));
          if (missingCards.length > 0) {
            deck.cards = [...(deck.cards || []), ...missingCards];
            modified = true;
            console.log(`Added ${missingCards.length} missing cards to deck "${deck.name}".`);
          }
        }
      }

      if (modified && !isDryRun) {
        await collectionsCol.updateOne(
          { _id: kanaCol._id },
          { $set: { decks: kanaCol.decks } }
        );
        console.log('✅ Updated Kana collection with unified cards.');
      } else {
        console.log('✅ Kana collection is already fully populated.');
      }
    }

    console.log('🎉 Kana module seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  seedKana();
}

module.exports = { seedKana };

