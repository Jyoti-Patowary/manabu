#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const connectDB = require('../src/lib/mongodb.js').default || require('../src/lib/mongodb.js');

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'n5_grammar.json');
let cards = [];
if (fs.existsSync(dataPath)) {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    cards = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read/parse data/n5_grammar.json:', err.message);
    process.exit(2);
  }
} else {
  console.error('Data file not found:', dataPath);
  process.exit(2);
}

async function importN5() {
  console.log('Connecting to MongoDB...');
  const mongoose = await connectDB();
  try {
    const db = mongoose.connection.db;
    const col = db.collection('collections');

    // Remove any existing 'N5 Grammar' collection document
    await col.deleteMany({ name: 'N5 Grammar' });

    const doc = {
      name: 'N5 Grammar',
      description: 'JLPT N5 grammar collection (imported)',
      decks: [
        {
          name: 'Grammar',
          cards: cards
        }
      ]
    };

    const res = await col.insertOne(doc);
    console.log('Inserted N5 Grammar collection _id:', res.insertedId.toString());
    console.log(`Cards inserted: ${cards.length}`);
  } catch (err) {
    console.error('Import error:', err);
    process.exitCode = 2;
  } finally {
    process.exit();
  }
}

if (require.main === module) {
  importN5().catch(err => { console.error(err); process.exit(2); });
}

module.exports = importN5;
