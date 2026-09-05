#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const connectDB = require('../src/lib/mongodb.js').default || require('../src/lib/mongodb.js');

async function importKana(filePath) {
  console.log('Connecting to MongoDB...');
  const mongoose = await connectDB();

  const dataPath = filePath || path.join(__dirname, '..', 'data', 'kana_import.json');
  if (!fs.existsSync(dataPath)) {
    console.error('JSON file not found:', dataPath);
    process.exit(2);
  }

  const raw = fs.readFileSync(dataPath, 'utf8');
  let items;
  try {
    items = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse JSON:', err.message);
    process.exit(2);
  }

  const hiragana = items.filter(i => String(i.type).toLowerCase() === 'hiragana');
  const katakana = items.filter(i => String(i.type).toLowerCase() === 'katakana');

  const collectionDoc = {
    name: 'Kana',
    description: 'Hiragana and Katakana',
    decks: [
      {
        name: 'Hiragana',
        cards: hiragana,
      },
      {
        name: 'Katakana',
        cards: katakana,
      },
    ],
  };

  try {
    // Remove any existing Kana collection, then insert fresh using low-level db to avoid model ESM imports
    const db = mongoose.connection.db;
    const col = db.collection('collections');
    await col.deleteMany({ name: 'Kana' });
    const res = await col.insertOne(collectionDoc);
    console.log('Imported Kana collection with _id:', res.insertedId.toString());
    console.log(`- Hiragana: ${hiragana.length} cards`);
    console.log(`- Katakana: ${katakana.length} cards`);
  } catch (err) {
    console.error('Error during import:', err);
    process.exitCode = 2;
  } finally {
    process.exit();
  }
}

if (require.main === module) {
  const argPath = process.argv[2];
  importKana(argPath).catch(err => {
    console.error(err);
    process.exit(2);
  });
}

module.exports = importKana;
