#!/usr/bin/env node
/**
 * Seeds or verifies the unified Grammar module in MongoDB across N5 and N4:
 * - Creates 'Grammar' collection if missing
 * - Populates N5 (169 points) and N4 (19 points) grammar decks
 * - Schema: content_type: 'grammar', jlpt_level: 'N5' | 'N4'
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

async function seedGrammar() {
  const isDryRun = process.argv.includes('--dry-run');
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  console.log(`⛩️ Seeding Unified Grammar Module across JLPT N5–N4 ${isDryRun ? '(DRY RUN)' : ''}...`);

  try {
    const { getGrammarByLevel, createGrammarCard } = await import('../src/lib/grammarData.js');

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    const db = mongoose.connection.db;
    const collectionsCol = db.collection('collections');

    let grammarCol = await collectionsCol.findOne({ name: { $regex: /grammar|文法/i } });

    const levels = ['N5', 'N4'];

    if (!grammarCol) {
      console.log('Creating "Grammar Master Collection" with N5 and N4 decks...');
      const decks = levels.map((level) => {
        const rawPoints = getGrammarByLevel(level);
        const cards = rawPoints.map((item) => createGrammarCard(item, level));
        return {
          _id: new mongoose.Types.ObjectId(),
          name: `${level} Grammar (文法)`,
          category: `JLPT ${level}`,
          cards,
        };
      });

      const newDoc = {
        name: 'Grammar',
        description: 'Complete JLPT Grammar points with structural formation rules, nuance, and audio examples',
        decks,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!isDryRun) {
        await collectionsCol.insertOne(newDoc);
        console.log(`✅ Created "Grammar" collection with N5 and N4 decks.`);
      }
    } else {
      console.log(`Found existing Grammar collection: "${grammarCol.name}". Checking decks...`);
      let modified = false;

      if (!Array.isArray(grammarCol.decks)) {
        grammarCol.decks = [];
      }

      for (const level of levels) {
        const deckName = `${level} Grammar (文法)`;
        let deck = grammarCol.decks.find((d) => (d.name || '').toLowerCase().includes(level.toLowerCase()));

        const rawPoints = getGrammarByLevel(level);
        const canonicalCards = rawPoints.map((item) => createGrammarCard(item, level));

        if (!deck) {
          console.log(`Adding missing deck: "${deckName}" (${canonicalCards.length} cards)...`);
          grammarCol.decks.push({
            _id: new mongoose.Types.ObjectId(),
            name: deckName,
            category: `JLPT ${level}`,
            cards: canonicalCards,
          });
          modified = true;
        } else {
          const existingGrammars = new Set((deck.cards || []).map((c) => c.grammar || c.meaning));
          const missingCards = canonicalCards.filter((c) => !existingGrammars.has(c.grammar));

          if (missingCards.length > 0) {
            deck.cards = [...(deck.cards || []), ...missingCards];
            modified = true;
            console.log(`Added ${missingCards.length} missing grammar points to deck "${deck.name}".`);
          }
        }
      }

      if (modified && !isDryRun) {
        await collectionsCol.updateOne(
          { _id: grammarCol._id },
          { $set: { decks: grammarCol.decks } }
        );
        console.log('✅ Updated Grammar collection with unified cards.');
      } else {
        console.log('✅ Grammar collection is already fully populated.');
      }
    }

    console.log('🎉 Grammar module seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  seedGrammar();
}

module.exports = { seedGrammar };

