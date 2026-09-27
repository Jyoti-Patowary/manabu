import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not configured');
}

async function seedVocab() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  const db = mongoose.connection.db;
  const collectionsColl = db.collection('collections');

  const levels = [
    { level: 'N5', file: 'data/n5_vocab.json', name: 'JLPT N5 Vocabulary (初級語彙)' },
    { level: 'N4', file: 'data/n4_vocab.json', name: 'JLPT N4 Vocabulary (初中級語彙)' },
    { level: 'N3', file: 'data/n3_vocab.json', name: 'JLPT N3 Vocabulary (中級語彙)' },
    { level: 'N2', file: 'data/n2_vocab.json', name: 'JLPT N2 Vocabulary (上中級語彙)' },
    { level: 'N1', file: 'data/n1_vocab.json', name: 'JLPT N1 Vocabulary (上級語彙)' },
  ];

  const now = Date.now();
  const decks = [];

  for (const { level, file, name } of levels) {
    if (!fs.existsSync(file)) {
      console.warn('File not found:', file);
      continue;
    }
    const rawCards = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`Processing ${level} cards: ${rawCards.length}...`);

    const cards = rawCards.map((c, idx) => {
      const isDue = idx < 15; // Set first 15 as due for immediate practice
      const isMastered = idx >= 15 && idx < 30;

      return {
        _id: new mongoose.Types.ObjectId(),
        content_type: 'vocab',
        jlpt_level: level,
        jlpt: level,
        category: `JLPT ${level} Vocabulary`,
        tags: Array.isArray(c.tags) ? c.tags : [level, 'vocab'],
        kanji: c.kanji || '',
        reading: c.reading || '',
        meaning: c.meaning || '',
        example: c.example || '',
        exampleReading: c.exampleReading || '',
        exampleMeaning: c.exampleMeaning || '',
        interval: isDue ? 1 : (isMastered ? 14 : 0),
        repetitions: isDue ? 1 : (isMastered ? 3 : 0),
        ease_factor: 2.5,
        easeFactor: 2.5,
        dueDate: isDue ? now - 3600000 : now + 86400000,
        next_review_date: isDue ? now - 3600000 : now + 86400000,
        mastered: isMastered,
        type: 'vocab',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    decks.push({
      _id: new mongoose.Types.ObjectId(),
      name,
      cards,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Find or update the Vocabulary collection
  const existingVocabCollection = await collectionsColl.findOne({ name: 'Vocabulary' });
  if (existingVocabCollection) {
    console.log('Updating existing Vocabulary collection with 5 complete JLPT decks...');
    await collectionsColl.updateOne(
      { _id: existingVocabCollection._id },
      {
        $set: {
          description: 'Complete JLPT N5, N4, N3, N2, and N1 Vocabulary (7,970+ words)',
          decks,
          updatedAt: new Date(),
        }
      }
    );
  } else {
    console.log('Creating new Vocabulary collection with 5 complete JLPT decks...');
    await collectionsColl.insertOne({
      _id: new mongoose.Types.ObjectId(),
      name: 'Vocabulary',
      description: 'Complete JLPT N5, N4, N3, N2, and N1 Vocabulary (7,970+ words)',
      decks,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log('MongoDB Vocabulary update COMPLETE!');
  const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);
  console.log(`Total decks seeded: ${decks.length}, Total cards seeded: ${totalCards}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

seedVocab().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

