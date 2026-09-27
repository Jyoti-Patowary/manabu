#!/usr/bin/env node
/**
 * Phase 1 Migration: Unified Content Model & N3 Vocabulary Migration
 * Migrates existing MongoDB collections and decks to the unified schema:
 * - content_type: 'vocab' | 'kanji' | 'grammar' | 'kana'
 * - jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null
 * - SM-2: interval, repetitions, ease_factor, next_review_date (with legacy easeFactor & dueDate mirrored)
 * - relationships: array of linked card references
 * - Imports/ensures N3 vocabulary from jlpt-n3-vocab.json
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

function normalizeJlptLevel(value) {
  if (value == null) return null;
  const text = String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const directMatch = text.match(/N[1-5]/);
  if (directMatch) return directMatch[0];
  const jlptMatch = text.match(/JLPTN([1-5])/);
  if (jlptMatch) return `N${jlptMatch[1]}`;
  return null;
}

function migrateCard(card, contextDeckName = '') {
  let rawType = card?.content_type || card?.type || 'vocab';
  if (rawType === 'hiragana' || rawType === 'katakana') {
    rawType = 'kana';
  } else if (!['vocab', 'kanji', 'grammar', 'kana'].includes(rawType)) {
    if (card?.grammar) {
      rawType = 'grammar';
    } else if (card?.onyomi || card?.kunyomi || card?.strokes) {
      rawType = 'kanji';
    } else {
      rawType = 'vocab';
    }
  }

  const contentType = rawType;
  const inferredLevel = normalizeJlptLevel(card?.jlpt_level ?? card?.jlpt ?? contextDeckName);
  const jlptLevel = contentType === 'kana' ? null : inferredLevel;

  const easeFactor = Number(card?.ease_factor ?? card?.easeFactor ?? 2.5);
  const nextReviewDate = Number(card?.next_review_date ?? card?.dueDate ?? Date.now());
  const relationships = Array.isArray(card?.relationships) ? card.relationships : [];

  return {
    ...card,
    content_type: contentType,
    jlpt_level: jlptLevel,
    relationships,
    type: card?.type || contentType,
    jlpt: jlptLevel || card?.jlpt || '',
    interval: Number(card?.interval ?? 0),
    repetitions: Number(card?.repetitions ?? 0),
    ease_factor: easeFactor,
    easeFactor,
    next_review_date: nextReviewDate,
    dueDate: nextReviewDate,
  };
}

async function runMigration() {
  const isDryRun = process.argv.includes('--dry-run');
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  console.log(`🚀 Starting Phase 1 migration ${isDryRun ? '(DRY RUN)' : ''}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    const db = mongoose.connection.db;

    // 1. Migrate Collections
    const collectionsCol = db.collection('collections');
    const allCollections = await collectionsCol.find({}).toArray();
    console.log(`Found ${allCollections.length} collections.`);

    let totalCardsMigrated = 0;

    for (const colDoc of allCollections) {
      let modified = false;
      const decks = colDoc.decks || [];

      for (const deck of decks) {
        if (!Array.isArray(deck.cards)) continue;

        const updatedCards = deck.cards.map((c) => {
          totalCardsMigrated++;
          return migrateCard(c, deck.name);
        });

        deck.cards = updatedCards;
        modified = true;
      }

      if (modified && !isDryRun) {
        await collectionsCol.updateOne(
          { _id: colDoc._id },
          { $set: { decks: colDoc.decks } }
        );
      }
    }

    console.log(`✅ Migrated ${totalCardsMigrated} cards across collections.`);

    // 2. Migrate Standalone Decks collection (if any)
    const decksCol = db.collection('decks');
    const standaloneDecks = await decksCol.find({}).toArray();
    if (standaloneDecks.length > 0) {
      console.log(`Found ${standaloneDecks.length} standalone decks.`);
      for (const deck of standaloneDecks) {
        if (!Array.isArray(deck.cards)) continue;
        const updatedCards = deck.cards.map((c) => migrateCard(c, deck.name));
        if (!isDryRun) {
          await decksCol.updateOne(
            { _id: deck._id },
            { $set: { cards: updatedCards } }
          );
        }
      }
      console.log(`✅ Migrated standalone decks.`);
    }

    // 3. Ensure JLPT N3 Vocabulary is present and unified
    const n3VocabPath = path.join(__dirname, '..', 'jlpt-n3-vocab.json');
    if (fs.existsSync(n3VocabPath)) {
      console.log('Checking JLPT N3 Vocabulary data file...');
      const rawN3 = fs.readFileSync(n3VocabPath, 'utf8');
      const n3Data = JSON.parse(rawN3);

      let n3Collection = await collectionsCol.findOne({ name: { $regex: /N3 Vocabulary/i } });
      if (!n3Collection) {
        console.log('Creating N3 Vocabulary collection...');
        const newCollection = {
          name: 'N3 Vocabulary',
          description: 'JLPT N3 Vocabulary Master Collection with Unified Schema',
          decks: [
            {
              _id: new mongoose.Types.ObjectId(),
              name: 'N3 Vocab Core',
              cards: [],
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        if (!isDryRun) {
          const insertRes = await collectionsCol.insertOne(newCollection);
          n3Collection = await collectionsCol.findOne({ _id: insertRes.insertedId });
        } else {
          n3Collection = newCollection;
        }
      }

      if (n3Collection && n3Collection.decks && n3Collection.decks.length > 0) {
        const targetDeck = n3Collection.decks[0];
        const existingSignatures = new Set(
          (targetDeck.cards || []).map((c) => `${c.kanji || ''}-${c.reading || ''}`)
        );

        let addedCount = 0;
        const cardsToAppend = [];

        for (const item of n3Data) {
          const sig = `${item.kanji || ''}-${item.reading || ''}`;
          if (!existingSignatures.has(sig)) {
            const newCard = migrateCard(
              {
                _id: new mongoose.Types.ObjectId(),
                content_type: 'vocab',
                jlpt_level: 'N3',
                type: 'vocab',
                jlpt: 'N3',
                kanji: item.kanji || '',
                reading: item.reading || '',
                meaning: item.meaning || '',
                partOfSpeech: item.type || '',
                interval: 0,
                repetitions: 0,
                ease_factor: 2.5,
                easeFactor: 2.5,
                next_review_date: Date.now(),
                dueDate: Date.now(),
                relationships: [],
              },
              'N3 Vocab Core'
            );
            cardsToAppend.push(newCard);
            existingSignatures.add(sig);
            addedCount++;
          }
        }

        if (cardsToAppend.length > 0 && !isDryRun) {
          targetDeck.cards.push(...cardsToAppend);
          await collectionsCol.updateOne(
            { _id: n3Collection._id },
            { $set: { decks: n3Collection.decks } }
          );
          console.log(`✅ Seeded ${addedCount} N3 vocabulary words into N3 Vocabulary collection.`);
        } else if (cardsToAppend.length > 0 && isDryRun) {
          console.log(`[DRY RUN] Would seed ${addedCount} N3 vocabulary words.`);
        } else {
          console.log('✅ N3 Vocabulary collection already up to date.');
        }
      }
    }

    console.log('🎉 Phase 1 migration completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { migrateCard, normalizeJlptLevel };

